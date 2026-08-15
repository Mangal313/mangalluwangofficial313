export async function validatePlayerMock(gameSlug: string, playerDetails: Record<string, any>) {
  if (!playerDetails.playerId) {
    return { success: false, reason: "Missing playerId" };
  }
  return { success: true };
}

export async function createRechargeMock(orderId: string, gameSlug: string, productName: string, playerDetails: Record<string, any>) {
  return {
    success: true,
    providerTransactionId: `fulfill_${orderId}`,
    message: "Mock recharge queued"
  };
}
