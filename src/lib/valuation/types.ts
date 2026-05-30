export type ModelLevel = "simple" | "roic" | "wealth";
export type AppMode =
  | "justifiedMultiple"
  | "impliedAssumptions"
  | "shareholderWealth";
export type DiscountRateMode = "manual" | "treasuryPlusERP";
export type PayoutTreatment = "reinvestExternally" | "holdCash" | "spend";

export interface ValuationAssumptions {
  currentEarnings: number;
  currentPE: number;

  discountRateMode: DiscountRateMode;
  manualDiscountRate: number;
  tenYearTreasuryYield: number;
  equityRiskPremium: number;
  specificRiskPremium: number;

  businessLife: number;
  perpetualBusiness: boolean;

  // Level 1 (simple)
  simpleGrowthRate: number;
  simpleDuration: number;
  simpleTerminalGrowth: number;
  simplePayoutRatio: number;

  // Level 2 (ROIC / reinvestment)
  stage1ROIC: number;
  stage1ReinvestmentRate: number;
  stage1Duration: number;
  matureROIC: number;
  matureReinvestmentRate: number;

  // Level 3 (shareholder wealth)
  purchasePE: number;
  exitPE: number;
  holdingPeriod: number;
  externalReinvestmentReturn: number;
  payoutTreatment: PayoutTreatment;
}

export interface YearlyValuationRow {
  year: number;
  earnings: number;
  roic: number;
  reinvestmentRate: number;
  earningsGrowth: number;
  reinvestedEarnings: number;
  ownerCashFlow: number;
  discountFactor: number;
  presentValue: number;
  fvPayout?: number;
}

export interface ValueByPeriod {
  years1To5: number;
  years6To10: number;
  years11To20: number;
  years21To40: number;
  years41Plus: number;
  terminalValue: number;
}

export interface ValuationResult {
  justifiedPE: number;
  currentPE: number;
  marginOfSafetyPercent: number;

  stage1Growth: number;
  stage1PayoutRatio: number;
  matureGrowth: number;
  maturePayoutRatio: number;

  pvStage1: number;
  pvMatureStage: number;
  pvTerminalValue: number;
  pvTotal: number;

  valueByPeriod: ValueByPeriod;
  yearlyRows: YearlyValuationRow[];

  warnings: string[];
  errors: string[];
}

export interface WealthResult {
  investorIRR: number;
  endingWealth: number;
  endingStockValue: number;
  fvOfPayouts: number;
  rawPayouts: number;
  externalReinvestmentGain: number;
  multipleChangeValue: number;
  earningsGrowthValue: number;
  purchasePrice: number;
  yearlyRows: YearlyValuationRow[];
  warnings: string[];
  errors: string[];
}
