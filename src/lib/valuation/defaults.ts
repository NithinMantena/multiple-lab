import type { ValuationAssumptions } from "./types";

export const DEFAULT_ASSUMPTIONS: ValuationAssumptions = {
  currentEarnings: 1.0,
  currentPE: 25.0,

  discountRateMode: "manual",
  manualDiscountRate: 0.09,
  tenYearTreasuryYield: 0.045,
  equityRiskPremium: 0.045,
  specificRiskPremium: 0.0,

  businessLife: 70,
  perpetualBusiness: false,

  simpleGrowthRate: 0.08,
  simpleDuration: 10,
  simpleTerminalGrowth: 0.03,
  simplePayoutRatio: 1.0,

  stage1ROIC: 0.25,
  stage1ReinvestmentRate: 0.4,
  stage1Duration: 10,
  matureROIC: 0.12,
  matureReinvestmentRate: 0.25,

  purchasePE: 25.0,
  exitPE: 20.0,
  holdingPeriod: 10,
  externalReinvestmentReturn: 0.08,
  payoutTreatment: "reinvestExternally",
};
