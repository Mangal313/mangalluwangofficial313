export async function validatePlayerMock(gameSlug: string, playerDetails: Record<string, any>) {
  // Basic validation for demo
  if (!playerDetails.playerId) {
    return { success: false, reason: "Missing playerId" };
  }
  return { success: true };
}

export async function createRechargeMock(orderId: string, gameSlug: string, productName: string, playerDetails: Record<string, any>) {
  // Simulate asynchronous fulfillment: return a mock transaction id
  return {
    success: true,
    providerTransactionId: `fulfill_${orderId}`,
    message: "Mock recharge queued"
  };
}
