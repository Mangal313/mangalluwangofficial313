import { NextResponse } from "next/server";
import { createPayment } from "@/lib/payments";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const amount = Number(body.amount) || 0;
  const currency = body.currency || "INR";
  if (!amount || amount <= 0) return NextResponse.json({ success: false, error: { code: "INVALID_AMOUNT", message: "Invalid amount" } }, { status: 400 });

  const payment = await createPayment(amount, currency, body.metadata);
  return NextResponse.json({ success: true, data: payment });
}
