export function formatMoney(
  amount: number,
  currency = "FCFA"
): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;

  return `${Math.round(safeAmount).toLocaleString(
    "fr-FR"
  )} ${currency}`;
}

export function formatShortMoney(amount: number): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const absolute = Math.abs(safeAmount);

  if (absolute >= 1_000_000) {
    return `${(safeAmount / 1_000_000).toFixed(1)} M`;
  }

  if (absolute >= 1_000) {
    return `${Math.round(safeAmount / 1_000)} k`;
  }

  return `${Math.round(safeAmount)}`;
}