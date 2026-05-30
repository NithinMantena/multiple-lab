import type {
  ValuationAssumptions,
  ValuationResult,
  WealthResult,
  YearlyValuationRow,
} from "./valuation";

export function rowsToCSV(rows: YearlyValuationRow[], includeFV = false): string {
  const headers = [
    "Year",
    "Earnings",
    "ROIC",
    "ReinvestmentRate",
    "EarningsGrowth",
    "ReinvestedEarnings",
    "OwnerCashFlow",
    "DiscountFactor",
    "PresentValue",
  ];
  if (includeFV) headers.push("FVPayout");
  const lines = [headers.join(",")];
  for (const r of rows) {
    const row = [
      r.year,
      r.earnings.toFixed(6),
      r.roic.toFixed(6),
      r.reinvestmentRate.toFixed(6),
      r.earningsGrowth.toFixed(6),
      r.reinvestedEarnings.toFixed(6),
      r.ownerCashFlow.toFixed(6),
      r.discountFactor.toFixed(8),
      r.presentValue.toFixed(8),
    ];
    if (includeFV) row.push((r.fvPayout ?? 0).toFixed(6));
    lines.push(row.join(","));
  }
  return lines.join("\n");
}

export function downloadFile(filename: string, content: string, mime = "text/csv") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function buildSummary(
  a: ValuationAssumptions,
  v: ValuationResult,
  level: "simple" | "roic" | "wealth",
  effectiveR: number,
  wealth?: WealthResult,
): string {
  const lines: string[] = [];
  if (level === "wealth" && wealth) {
    lines.push(
      `Shareholder Wealth — Purchase ${a.purchasePE.toFixed(1)}x, Exit ${a.exitPE.toFixed(1)}x, ${a.holdingPeriod}yr hold.`,
    );
    lines.push(
      `ROIC ${pct(a.stage1ROIC)}, reinvestment ${pct(a.stage1ReinvestmentRate)} for ${a.stage1Duration}yr; then mature ${pct(a.matureROIC)} ROIC / ${pct(a.matureReinvestmentRate)} reinvestment.`,
    );
    lines.push(
      `External reinvestment ${pct(a.externalReinvestmentReturn)} (${a.payoutTreatment}).`,
    );
    lines.push(
      `Investor IRR: ${pct(wealth.investorIRR, 2)}. Ending wealth: $${wealth.endingWealth.toFixed(2)} (stock ${wealth.endingStockValue.toFixed(2)} + payouts FV ${wealth.fvOfPayouts.toFixed(2)}).`,
    );
    return lines.join("\n");
  }
  if (level === "simple") {
    lines.push(
      `At ${pct(effectiveR)} discount rate, ${pct(a.simpleGrowthRate)} growth for ${a.simpleDuration}y, ${pct(a.simpleTerminalGrowth)} terminal, ${pct(a.simplePayoutRatio)} payout — justified P/E ${v.justifiedPE.toFixed(1)}x.`,
    );
  } else {
    lines.push(
      `At ${pct(effectiveR)} discount rate, ${pct(a.stage1ROIC)} ROIC, ${pct(a.stage1ReinvestmentRate)} reinvestment, ${a.stage1Duration}-year high-return period, the business grows at ${pct(a.stage1ROIC * a.stage1ReinvestmentRate)} while paying out ${pct(1 - a.stage1ReinvestmentRate)} of earnings.`,
    );
    lines.push(
      `Under a ${a.businessLife}-year ${a.perpetualBusiness ? "perpetual" : "finite-life"} model these assumptions justify a ${v.justifiedPE.toFixed(1)}x P/E multiple. At the current ${a.currentPE.toFixed(1)}x P/E, the stock is priced ${(((a.currentPE - v.justifiedPE) / v.justifiedPE) * 100).toFixed(1)}% ${a.currentPE >= v.justifiedPE ? "above" : "below"} this assumption set.`,
    );
  }
  return lines.join("\n");
}

function pct(n: number, digits = 1): string {
  return `${(n * 100).toFixed(digits)}%`;
}
