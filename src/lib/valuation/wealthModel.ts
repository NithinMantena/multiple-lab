import type {
  ValuationAssumptions,
  WealthResult,
  YearlyValuationRow,
} from "./types";

export function calculateWealthModel(a: ValuationAssumptions): WealthResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  const e0 = a.currentEarnings || 1;
  const n = Math.max(0, Math.floor(a.stage1Duration));
  const h = Math.max(1, Math.floor(a.holdingPeriod));
  const roic1 = a.stage1ROIC;
  const rr1 = a.stage1ReinvestmentRate;
  const roic2 = a.matureROIC;
  const rr2 = a.matureReinvestmentRate;
  const g1 = roic1 * rr1;
  const g2 = roic2 * rr2;
  const payout1 = 1 - rr1;
  const payout2 = 1 - rr2;
  const ext = a.externalReinvestmentReturn;

  if (a.purchasePE <= 0) errors.push("Purchase P/E must be greater than zero.");
  if (a.exitPE < 0) errors.push("Exit P/E must not be negative.");
  if (a.holdingPeriod <= 0)
    errors.push("Holding period must be greater than zero.");

  const purchasePrice = a.purchasePE * e0;

  if (errors.length > 0) {
    return {
      investorIRR: 0,
      endingWealth: 0,
      endingStockValue: 0,
      fvOfPayouts: 0,
      rawPayouts: 0,
      externalReinvestmentGain: 0,
      multipleChangeValue: 0,
      earningsGrowthValue: 0,
      purchasePrice,
      yearlyRows: [],
      warnings,
      errors,
    };
  }

  let prev = e0;
  const rows: YearlyValuationRow[] = [];
  let rawPayouts = 0;
  let fvOfPayouts = 0;

  for (let t = 1; t <= h; t++) {
    const inStage1 = t <= n;
    const growth = inStage1 ? g1 : g2;
    const payout = inStage1 ? payout1 : payout2;
    const reinvest = inStage1 ? rr1 : rr2;
    const roic = inStage1 ? roic1 : roic2;
    const earnings = prev * (1 + growth);
    const payoutCash = earnings * payout;

    let fv = 0;
    if (a.payoutTreatment === "reinvestExternally") {
      fv = payoutCash * Math.pow(1 + ext, h - t);
    } else if (a.payoutTreatment === "holdCash") {
      fv = payoutCash;
    } else {
      fv = 0;
    }

    rows.push({
      year: t,
      earnings,
      roic,
      reinvestmentRate: reinvest,
      earningsGrowth: growth,
      reinvestedEarnings: earnings * reinvest,
      ownerCashFlow: payoutCash,
      discountFactor: 1 / Math.pow(1 + ext, t),
      presentValue: 0,
      fvPayout: fv,
    });

    rawPayouts += payoutCash;
    fvOfPayouts += fv;
    prev = earnings;
  }

  const endingEarnings = prev;
  const endingStockValue = endingEarnings * a.exitPE;
  const endingWealth = endingStockValue + fvOfPayouts;
  const investorIRR =
    purchasePrice > 0 ? Math.pow(endingWealth / purchasePrice, 1 / h) - 1 : 0;

  const endingBusinessValueAtPurchasePE = endingEarnings * a.purchasePE;
  const earningsGrowthValue = endingBusinessValueAtPurchasePE - purchasePrice;
  const multipleChangeValue = endingEarnings * (a.exitPE - a.purchasePE);
  const externalReinvestmentGain = fvOfPayouts - rawPayouts;

  if (a.exitPE > a.purchasePE * 1.5)
    warnings.push("Exit P/E more than 50% above purchase P/E is aggressive.");
  if (ext > 0.15)
    warnings.push("External reinvestment return above 15% is aggressive.");

  return {
    investorIRR,
    endingWealth,
    endingStockValue,
    fvOfPayouts,
    rawPayouts,
    externalReinvestmentGain,
    multipleChangeValue,
    earningsGrowthValue,
    purchasePrice,
    yearlyRows: rows,
    warnings,
    errors,
  };
}
