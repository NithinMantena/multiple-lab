export function fmtPercent(n: number, digits = 1): string {
  if (!isFinite(n)) return "—";
  return `${(n * 100).toFixed(digits)}%`;
}

export function fmtMultiple(n: number, digits = 1): string {
  if (!isFinite(n)) return "—";
  return `${n.toFixed(digits)}x`;
}

export function fmtDollar(n: number, digits = 2): string {
  if (!isFinite(n)) return "—";
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(n).toFixed(digits)}`;
}

export function fmtNumber(n: number, digits = 2): string {
  if (!isFinite(n)) return "—";
  return n.toFixed(digits);
}

export function fmtYears(n: number): string {
  return `${Math.round(n)} ${Math.round(n) === 1 ? "year" : "years"}`;
}

export function fmtSignedPercent(n: number, digits = 1): string {
  if (!isFinite(n)) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}${(n * 100).toFixed(digits)}%`;
}

/**
 * Margin-of-safety style measure: positive means market price sits below
 * intrinsic value (a discount); negative means it sits above (a premium).
 *
 *   discount = (intrinsic − market) / intrinsic
 */
export function discountToIntrinsic(
  intrinsic: number,
  market: number,
): number {
  if (!isFinite(intrinsic) || intrinsic <= 0) return NaN;
  return (intrinsic - market) / intrinsic;
}
