import { v4 as uuidv4 } from "uuid";

export type CreatePaymentResult = {
  provider: "mock";
  paymentId: string;
  paymentUrl: string;
  amount: number;
  currency: string;
};

export async function createPaymentMock(amount: number, currency = "INR", metadata?: any): Promise<CreatePaymentResult> {
  const paymentId = `mock_${uuidv4()}`;
  return {
    provider: "mock",
    paymentId,
    paymentUrl: `http://localhost:3000/mock-payments/checkout/${paymentId}`,
    amount,
    currency
  };
}

export async function verifyPaymentMock(providerPaymentId: string): Promise<{ success: boolean; transactionId?: string }> {
  if (providerPaymentId.startsWith("mock_")) {
    return { success: true, transactionId: `txn_${providerPaymentId.slice(5)}` };
  }
  return { success: false };
}
