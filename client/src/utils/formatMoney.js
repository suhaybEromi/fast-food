export function formatMoney(amount) {
  // Convert to number first, then format with thousands separator (e.g., "15.000")
  return Number(amount).toLocaleString("de-DE");
}
