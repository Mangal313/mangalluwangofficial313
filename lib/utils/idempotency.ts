export const processedEvents = new Set<string>();

export async function ensureIdempotent(eventId: string): Promise<boolean> {
  if (processedEvents.has(eventId)) return false;
  processedEvents.add(eventId);
  return true;
}
