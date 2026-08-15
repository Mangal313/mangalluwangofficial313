import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { processedEvents, ensureIdempotent } from "@/lib/utils/idempotency";
import { verifyPayment } from "@/lib/payments";

export async function POST(request: Request) {
  // parse event
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ success: false, error: { code: "INVALID_PAYLOAD", message: "Invalid payload" } }, { status: 400 });

  const eventId = body.id || body.eventId || JSON.stringify(body).slice(0, 200);
  const isNew = await ensureIdempotent(eventId);
  if (!isNew) {
    return NextResponse.json({ success: true, message: "Already processed" });
  }

  const provider = process.env.PAYMENT_PROVIDER || "mock";

  try {
    // For mock provider, body should contain providerPaymentId and status
    const providerPaymentId = body.providerPaymentId || body.paymentId || body.data?.id;
    const status = body.status || body.data?.status || "unknown";

    if (!providerPaymentId) return NextResponse.json({ success: false, error: { code: "MISSING_ID", message: "Missing provider payment id" } }, { status: 400 });

    // verify with provider
    const result = await verifyPayment(provider, providerPaymentId);

    if (result.success) {
      // update payment and order
      const payment = await prisma.payment.updateMany({
        where: { providerPaymentId },
        data: { status: "PAID", transactionId: result.transactionId as any }
      });

      // find order and update
      const paymentRecord = await prisma.payment.findUnique({ where: { providerPaymentId } });
      if (paymentRecord?.orderId) {
        await prisma.order.update({ where: { id: paymentRecord.orderId }, data: { paymentStatus: "PAID", status: "PROCESSING" } });
        // trigger fulfillment (fire-and-forget)
        const order = await prisma.order.findUnique({ where: { id: paymentRecord.orderId } });
        const product = await prisma.rechargeProduct.findUnique({ where: { id: order!.productId } });
        const { createRechargeMock } = await import("@/lib/fulfillment/mockFulfillment");
        const fulfillment = await createRechargeMock(order!.id, (order as any).game?.slug || "unknown", product?.name || "package", order!.playerDetails as any);
        if (fulfillment.success) {
          await prisma.order.update({ where: { id: order!.id }, data: { status: "COMPLETED" } });
        }
      }
    } else {
      // mark as failed
      await prisma.payment.updateMany({
        where: { providerPaymentId },
        data: { status: "FAILED", failureReason: "Provider verification failed" }
      });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ success: false, error: { code: "WEBHOOK_ERROR", message: "Processing failed" } }, { status: 500 });
  }
}
