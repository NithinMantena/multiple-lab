import type { ValuationAssumptions } from "./types";

export function resolveDiscountRate(a: ValuationAssumptions): number {
  if (a.discountRateMode === "treasuryPlusERP") {
    return a.tenYearTreasuryYield + a.equityRiskPremium + a.specificRiskPremium;
  }
  return a.manualDiscountRate;
}
