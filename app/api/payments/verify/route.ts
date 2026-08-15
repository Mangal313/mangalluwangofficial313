import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyPayment } from "@/lib/payments";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const { provider, providerPaymentId, orderId } = body || {};
  if (!provider || !providerPaymentId || !orderId) return NextResponse.json({ success: false, error: { code: "INVALID_REQUEST", message: "Missing parameters" } }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { payment: true, product: true } });
  if (!order) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Order not found" } }, { status: 404 });

  // verify using provider
  const result = await verifyPayment(provider, providerPaymentId);
  if (!result.success) {
    // update payment status
    await prisma.payment.updateMany({ where: { providerPaymentId }, data: { status: "FAILED", failureReason: "Verification failed" } });
    await prisma.order.update({ where: { id: orderId }, data: { paymentStatus: "FAILED", status: "FAILED", failureReason: "Payment verification failed" } });
    return NextResponse.json({ success: false, error: { code: "VERIFICATION_FAILED", message: "Payment verification failed" } }, { status: 400 });
  }

  // mark payment as PAID and create transaction record
  await prisma.payment.updateMany({
    where: { providerPaymentId },
    data: { status: "PAID", transactionId: result.transactionId as any }
  });

  await prisma.order.update({ where: { id: orderId }, data: { paymentStatus: "PAID", status: "PROCESSING" } });

  // trigger fulfillment (mock)
  // NOTE: actual fulfillment should be queued and processed asynchronously
  // For demo we call mockFulfillment
  const { createRechargeMock } = await import("@/lib/fulfillment/mockFulfillment");
  const product = await prisma.rechargeProduct.findUnique({ where: { id: order.productId } });
  const fulfillment = await createRechargeMock(order.id, (order as any).game?.slug || "unknown", product?.name || "package", order.playerDetails as any);

  if (fulfillment.success) {
    await prisma.order.update({ where: { id: orderId }, data: { status: "COMPLETED" } });
  }

  return NextResponse.json({ success: true, data: { transactionId: result.transactionId } });
}
