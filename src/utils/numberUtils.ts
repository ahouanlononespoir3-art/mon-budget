export function safeNumber(
  value: unknown,
  fallback = 0
): number {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
}

export function positiveNumber(value: unknown): number {
  return Math.max(0, Math.round(safeNumber(value)));
}

export function clamp(
  value: number,
  min: number,
  max: number
): number {
  return Math.min(Math.max(value, min), max);
}