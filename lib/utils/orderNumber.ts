export function generateOrderNumber(): string {
  const date = new Date();
  const YYYY = date.getFullYear().toString();
  const MM = String(date.getMonth() + 1).padStart(2, "0");
  const DD = String(date.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `GR-${YYYY}${MM}${DD}-${rand}`;
}
