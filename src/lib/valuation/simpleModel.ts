import { resolveDiscountRate } from "./discountRate";
import type {
  ValuationAssumptions,
  ValuationResult,
  YearlyValuationRow,
  ValueByPeriod,
} from "./types";

interface ProjectionParams {
  e0: number;
  g1: number;
  n: number;
  gT: number;
  payout: number;
  r: number;
  L: number;
  perpetual: boolean;
}

export function projectSimple(p: ProjectionParams): {
  rows: YearlyValuationRow[];
  pvExplicit: number;
  pvAfterExplicit: number;
  pvTerminal: number;
  pvTotal: number;
} {
  const { e0, g1, n, gT, payout, r, L, perpetual } = p;
  const rows: YearlyValuationRow[] = [];

  let prev = e0;
  let pvExplicit = 0;
  let pvAfterExplicit = 0;

  const horizon = perpetual ? n : L;
  for (let t = 1; t <= horizon; t++) {
    const growth = t <= n ? g1 : gT;
    const earnings = prev * (1 + growth);
    const ownerCashFlow = earnings * payout;
    const discountFactor = 1 / Math.pow(1 + r, t);
    const presentValue = ownerCashFlow * discountFactor;

    rows.push({
      year: t,
      earnings,
      roic: 0,
      reinvestmentRate: 1 - payout,
      earningsGrowth: growth,
      reinvestedEarnings: earnings * (1 - payout),
      ownerCashFlow,
      discountFactor,
      presentValue,
    });

    if (t <= n) pvExplicit += presentValue;
    else pvAfterExplicit += presentValue;
    prev = earnings;
  }

  let pvTerminal = 0;
  if (perpetual && r > gT) {
    const earningsAtN = e0 * Math.pow(1 + g1, n);
    const ownerCashFlowNPlus1 = earningsAtN * (1 + gT) * payout;
    const terminalValueAtN = ownerCashFlowNPlus1 / (r - gT);
    pvTerminal = terminalValueAtN / Math.pow(1 + r, n);
  }

  const pvTotal = pvExplicit + pvAfterExplicit + pvTerminal;
  return { rows, pvExplicit, pvAfterExplicit, pvTerminal, pvTotal };
}

function bucketValue(rows: YearlyValuationRow[]): ValueByPeriod {
  const buckets: ValueByPeriod = {
    years1To5: 0,
    years6To10: 0,
    years11To20: 0,
    years21To40: 0,
    years41Plus: 0,
    terminalValue: 0,
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

export function calculateSimpleModel(
  a: ValuationAssumptions,
): ValuationResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  const e0 = a.currentEarnings || 1;
  const r = resolveDiscountRate(a);
  const g1 = a.simpleGrowthRate;
  const n = Math.max(0, Math.floor(a.simpleDuration));
  const gT = a.simpleTerminalGrowth;
  const payout = a.simplePayoutRatio;
  const L = Math.max(n, Math.floor(a.businessLife));

  if (payout < 0 || payout > 1)
    errors.push("Payout ratio must be between 0% and 100%.");
  if (a.perpetualBusiness && r <= gT)
    errors.push(
      "Discount rate must exceed terminal growth in perpetual mode.",
    );
  if (a.currentPE <= 0)
    errors.push("Current market P/E must be greater than zero.");

  if (errors.length > 0) {
    return emptyResult(e0, a.currentPE, errors);
  }

  const { rows, pvExplicit, pvAfterExplicit, pvTerminal, pvTotal } =
    projectSimple({
      e0,
      g1,
      n,
      gT,
      payout,
      r,
      L,
      perpetual: a.perpetualBusiness,
    });

  const justifiedPE = pvTotal / e0;
  const marginOfSafetyPercent =
    a.currentPE > 0 ? justifiedPE / a.currentPE - 1 : 0;

  if (gT > 0.05)
    warnings.push("Long-term mature growth above 5% may be aggressive.");
  if (n > 30) warnings.push("Stage 1 duration above 30 years is aggressive.");
  const valueByPeriod = bucketValue(rows);
  const distantValue =
    valueByPeriod.years21To40 + valueByPeriod.years41Plus + pvTerminal;
  if (distantValue / pvTotal > 0.5)
    warnings.push(
      `Warning: ${((distantValue / pvTotal) * 100).toFixed(0)}% of value comes from cash flows after year 20.`,
    );
  if (a.perpetualBusiness && pvTerminal / pvTotal > 0.5)
    warnings.push(
      `Warning: ${((pvTerminal / pvTotal) * 100).toFixed(0)}% of value comes from terminal value.`,
    );

  return {
    justifiedPE,
    currentPE: a.currentPE,
    marginOfSafetyPercent,
    stage1Growth: g1,
    stage1PayoutRatio: payout,
    matureGrowth: gT,
    maturePayoutRatio: payout,
    pvStage1: pvExplicit,
    pvMatureStage: pvAfterExplicit,
    pvTerminalValue: pvTerminal,
    pvTotal,
    valueByPeriod,
    yearlyRows: rows,
    warnings,
    errors,
  };
}

function emptyResult(
  e0: number,
  currentPE: number,
  errors: string[],
): ValuationResult {
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
