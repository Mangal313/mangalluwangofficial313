import * as mock from "./mock";
import * as stripe from "./stripe";

export async function createPayment(amount: number, currency = "INR", metadata?: any) {
  const provider = process.env.PAYMENT_PROVIDER || "mock";
  if (provider === "stripe") {
    return stripe.createStripePayment(amount, currency, metadata);
  }
  return mock.createPaymentMock(amount, currency, metadata);
}

export async function verifyPayment(provider: string, providerPaymentId: string) {
  if (provider === "stripe") {
    return stripe.verifyStripePayment(providerPaymentId);
  }
  return mock.verifyPaymentMock(providerPaymentId);
}
