import {
  fmtMultiple,
  fmtPercent,
  type AppMode,
  type ModelLevel,
  type ValuationAssumptions,
} from "../lib/valuation";
import type { ValuationBundle } from "../hooks/useValuation";

interface Props {
  bundle: ValuationBundle;
  assumptions: ValuationAssumptions;
  level: ModelLevel;
  mode: AppMode;
}

export function ExplanationText({ bundle, assumptions, level, mode }: Props) {
  const text = generate(bundle, assumptions, level, mode);
  return (
    <div className="rounded-md bg-ink-50/60 border border-ink-200 p-3 text-sm leading-relaxed text-ink-700">
      {text}
    </div>
  );
}

function generate(
  bundle: ValuationBundle,
  a: ValuationAssumptions,
  level: ModelLevel,
  mode: AppMode,
): string {
  if (mode === "shareholderWealth") {
    const w = bundle.wealth;
    return `Buying at ${fmtMultiple(a.purchasePE)}, exiting at ${fmtMultiple(a.exitPE)} after ${a.holdingPeriod} years and reinvesting payouts at ${fmtPercent(a.externalReinvestmentReturn)} produces an investor IRR of ${fmtPercent(w.investorIRR, 2)} and ending wealth of ${w.endingWealth.toFixed(2)} per $${a.currentEarnings.toFixed(2)} of starting earnings.`;
  }
  const v = bundle.valuation;
  const r = bundle.effectiveDiscountRate;
  if (level === "simple") {
    return `At a ${fmtPercent(r)} discount rate, ${fmtPercent(a.simpleGrowthRate)} earnings growth for ${a.simpleDuration} years, ${fmtPercent(a.simpleTerminalGrowth)} terminal growth, and ${fmtPercent(a.simplePayoutRatio)} payout, these assumptions justify a ${fmtMultiple(v.justifiedPE)} earnings multiple under a ${assumptions(a)}-year ${a.perpetualBusiness ? "perpetual" : "finite-life"} model.`;
  }
  const g1 = a.stage1ROIC * a.stage1ReinvestmentRate;
  const payout1 = 1 - a.stage1ReinvestmentRate;
  return `At a ${fmtPercent(r)} discount rate, ${fmtPercent(a.stage1ROIC)} ROIC, ${fmtPercent(a.stage1ReinvestmentRate)} reinvestment rate, and ${a.stage1Duration}-year high-return period, the business grows earnings at ${fmtPercent(g1)} while paying out ${fmtPercent(payout1)} of earnings. These assumptions justify a ${fmtMultiple(v.justifiedPE)} earnings multiple under a ${a.businessLife}-year ${a.perpetualBusiness ? "perpetual" : "finite-life"} model. At the current ${fmtMultiple(a.currentPE)} P/E, the stock is priced ${(((a.currentPE - v.justifiedPE) / v.justifiedPE) * 100).toFixed(1)}% ${a.currentPE >= v.justifiedPE ? "above" : "below"} this assumption set.`;
}

function assumptions(a: ValuationAssumptions): number {
  return a.businessLife;
}
