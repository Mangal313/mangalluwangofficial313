import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/nextAuthOptions";
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { createOrderSchema } from "@/lib/validation/schemas";
import { generateOrderNumber } from "@/lib/utils/orderNumber";
import { createPayment } from "@/lib/payments";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: { code: "INVALID_REQUEST", message: "Invalid request", details: parsed.error.flatten() } }, { status: 400 });
  }

  const { gameId, productId, playerDetails } = parsed.data;

  const product = await prisma.rechargeProduct.findUnique({ where: { id: productId }, include: { game: true } });
  if (!product) return NextResponse.json({ success: false, error: { code: "INVALID_PRODUCT", message: "Invalid product" } }, { status: 400 });
  if (product.gameId !== gameId) return NextResponse.json({ success: false, error: { code: "MISMATCH", message: "Product does not belong to game" } }, { status: 400 });
  if (!product.active) return NextResponse.json({ success: false, error: { code: "INACTIVE_PRODUCT", message: "Product not available" } }, { status: 400 });

  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game) return NextResponse.json({ success: false, error: { code: "INVALID_GAME", message: "Game not found" } }, { status: 400 });
  const required = (game.requiredFields as any) || {};
  for (const key of Object.keys(required)) {
    if (required[key].required && !playerDetails[key]) {
      return NextResponse.json({ success: false, error: { code: "INVALID_PLAYER_DETAILS", message: `Missing ${key}` } }, { status: 400 });
    }
  }

  const amount = product.sellingPrice;
  const currency = product.currency || "INR";

  const orderNumber = generateOrderNumber();
  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId: session.user?.id,
      gameId,
      productId,
      playerDetails: playerDetails as any,
      amount,
      currency,
      status: "PENDING",
      paymentStatus: "UNPAID"
    }
  });

  const payment = await createPayment(amount, currency, { orderId: order.id, name: product.name });

  const savedPayment = await prisma.payment.create({
    data: {
      provider: payment.provider,
      providerPaymentId: (payment as any).paymentId,
      providerPaymentData: payment as any,
      orderId: order.id,
      amount,
      currency,
      status: "PENDING"
    }
  });

  await prisma.order.update({ where: { id: order.id }, data: { paymentId: savedPayment.id, paymentStatus: "PENDING" } });

  return NextResponse.json({
    success: true,
    data: {
      orderId: order.id,
      orderNumber,
      paymentUrl: (payment as any).paymentUrl,
      provider: payment.provider,
      providerPaymentId: (payment as any).paymentId
    }
  });
}
