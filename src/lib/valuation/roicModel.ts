import { resolveDiscountRate } from "./discountRate";
import type {
  ValuationAssumptions,
  ValuationResult,
  YearlyValuationRow,
  ValueByPeriod,
} from "./types";

interface ROICProjectionParams {
  e0: number;
  roic1: number;
  rr1: number;
  n: number;
  roic2: number;
  rr2: number;
  r: number;
  L: number;
  perpetual: boolean;
}

export function projectROIC(p: ROICProjectionParams): {
  rows: YearlyValuationRow[];
  pvStage1: number;
  pvMatureExplicit: number;
  pvTerminal: number;
  pvTotal: number;
} {
  const { e0, roic1, rr1, n, roic2, rr2, r, L, perpetual } = p;
  const g1 = roic1 * rr1;
  const g2 = roic2 * rr2;
  const payout1 = 1 - rr1;
  const payout2 = 1 - rr2;

  const rows: YearlyValuationRow[] = [];
  let prev = e0;
  let pvStage1 = 0;
  let pvMatureExplicit = 0;

  const horizon = perpetual ? n : L;
  for (let t = 1; t <= horizon; t++) {
    const inStage1 = t <= n;
    const growth = inStage1 ? g1 : g2;
    const payout = inStage1 ? payout1 : payout2;
    const reinvest = inStage1 ? rr1 : rr2;
    const roic = inStage1 ? roic1 : roic2;
    const earnings = prev * (1 + growth);
    const ownerCashFlow = earnings * payout;
    const discountFactor = 1 / Math.pow(1 + r, t);
    const presentValue = ownerCashFlow * discountFactor;

    rows.push({
      year: t,
      earnings,
      roic,
      reinvestmentRate: reinvest,
      earningsGrowth: growth,
      reinvestedEarnings: earnings * reinvest,
      ownerCashFlow,
      discountFactor,
      presentValue,
    });

    if (inStage1) pvStage1 += presentValue;
    else pvMatureExplicit += presentValue;
    prev = earnings;
  }

  let pvTerminal = 0;
  if (perpetual && r > g2) {
    const earningsAtN = e0 * Math.pow(1 + g1, n);
    const ownerCashFlowNPlus1 = earningsAtN * (1 + g2) * payout2;
    const terminalValueAtN = ownerCashFlowNPlus1 / (r - g2);
    pvTerminal = terminalValueAtN / Math.pow(1 + r, n);
  }

  const pvTotal = pvStage1 + pvMatureExplicit + pvTerminal;
  return { rows, pvStage1, pvMatureExplicit, pvTerminal, pvTotal };
}

function bucketValue(
  rows: YearlyValuationRow[],
  terminalValue: number,
): ValueByPeriod {
  const buckets: ValueByPeriod = {
    years1To5: 0,
    years6To10: 0,
    years11To20: 0,
    years21To40: 0,
    years41Plus: 0,
    terminalValue,
  };
  for (const row of rows) {
    if (row.year <= 5) buckets.years1To5 += row.presentValue;
    else if (row.year <= 10) buckets.years6To10 += row.presentValue;
    else if (row.year <= 20) buckets.years11To20 += row.presentValue;
    else if (row.year <= 40) buckets.years21To40 += row.presentValue;
    else buckets.years41Plus += row.presentValue;
  }
  return buckets;
}

export function calculateROICModel(a: ValuationAssumptions): ValuationResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  const e0 = a.currentEarnings || 1;
  const r = resolveDiscountRate(a);
  const n = Math.max(0, Math.floor(a.stage1Duration));
  const L = Math.max(n, Math.floor(a.businessLife));
  const roic1 = a.stage1ROIC;
  const rr1 = a.stage1ReinvestmentRate;
  const roic2 = a.matureROIC;
  const rr2 = a.matureReinvestmentRate;
  const g2 = roic2 * rr2;

  if (rr1 < 0 || rr1 > 1)
    errors.push("Stage 1 reinvestment rate must be between 0% and 100%.");
  if (rr2 < 0 || rr2 > 1)
    errors.push("Mature reinvestment rate must be between 0% and 100%.");
  if (a.perpetualBusiness && r <= g2)
    errors.push("Discount rate must exceed mature growth in perpetual mode.");
  if (L < n) errors.push("Business life must be at least Stage 1 duration.");
  if (a.currentPE <= 0)
    errors.push("Current market P/E must be greater than zero.");

  if (errors.length > 0) return emptyResult(a.currentPE, errors);

  const { rows, pvStage1, pvMatureExplicit, pvTerminal, pvTotal } = projectROIC(
    {
      e0,
      roic1,
      rr1,
      n,
      roic2,
      rr2,
      r,
      L,
      perpetual: a.perpetualBusiness,
    },
  );

  const justifiedPE = pvTotal / e0;
  const marginOfSafetyPercent =
    a.currentPE > 0 ? justifiedPE / a.currentPE - 1 : 0;

  if (roic1 > 1)
    warnings.push("Stage 1 ROIC above 100% is unusually aggressive.");
  if (roic2 > 0.3)
    warnings.push("Mature ROIC above 30% is unusually aggressive.");
  if (g2 > 0.05)
    warnings.push("Long-term mature growth above 5% may be aggressive.");
  if (n > 30) warnings.push("Stage 1 duration above 30 years is aggressive.");
  if (rr1 > 0.8 || rr2 > 0.8)
    warnings.push("Reinvestment rate above 80% is unusually high.");
  const valueByPeriod = bucketValue(rows, pvTerminal);
  const distantValue =
    valueByPeriod.years21To40 + valueByPeriod.years41Plus + pvTerminal;
  if (pvTotal > 0 && distantValue / pvTotal > 0.5)
    warnings.push(
      `${((distantValue / pvTotal) * 100).toFixed(0)}% of the justified multiple comes from cash flows after year 20. Highly sensitive to long-term assumptions.`,
    );
  if (a.perpetualBusiness && pvTotal > 0 && pvTerminal / pvTotal > 0.5)
    warnings.push(
      `${((pvTerminal / pvTotal) * 100).toFixed(0)}% of value comes from terminal value.`,
    );

  return {
    justifiedPE,
    currentPE: a.currentPE,
    marginOfSafetyPercent,
    stage1Growth: roic1 * rr1,
    stage1PayoutRatio: 1 - rr1,
    matureGrowth: g2,
    maturePayoutRatio: 1 - rr2,
    pvStage1,
    pvMatureStage: pvMatureExplicit,
    pvTerminalValue: pvTerminal,
    pvTotal,
    valueByPeriod,
    yearlyRows: rows,
    warnings,
    errors,
  };
}

function emptyResult(currentPE: number, errors: string[]): ValuationResult {
  return {
    justifiedPE: 0,
    currentPE,
    marginOfSafetyPercent: 0,
    stage1Growth: 0,
    stage1PayoutRatio: 0,
    matureGrowth: 0,
    maturePayoutRatio: 0,
    pvStage1: 0,
    pvMatureStage: 0,
    pvTerminalValue: 0,
    pvTotal: 0,
    valueByPeriod: {
      years1To5: 0,
      years6To10: 0,
      years11To20: 0,
      years21To40: 0,
      years41Plus: 0,
      terminalValue: 0,
    },
    yearlyRows: [],
    warnings: [],
    errors,
  };
}
