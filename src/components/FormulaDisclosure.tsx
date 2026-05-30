import { useState } from "react";
import type { ModelLevel } from "../lib/valuation";
import { Section } from "./primitives";

export function FormulaDisclosure({ level }: { level: ModelLevel }) {
  const [open, setOpen] = useState(false);
  return (
    <Section
      title="How this is calculated"
      right={
        <button
          onClick={() => setOpen((o) => !o)}
          className="text-xs px-2 py-1 rounded border border-ink-200 text-ink-600 hover:bg-ink-50"
        >
          {open ? "Hide" : "Show"}
        </button>
      }
    >
      {open ? (
        <div className="font-mono text-[12px] leading-relaxed space-y-3 text-ink-700">
          {level === "simple" ? (
            <>
              <pre className="whitespace-pre-wrap">{`Earnings[t] = Earnings[t-1] × (1 + g1)            if t ≤ n
Earnings[t] = Earnings[t-1] × (1 + gT)            if t > n
OwnerCashFlow[t] = Earnings[t] × payout
PV[t] = OwnerCashFlow[t] / (1 + r)^t
JustifiedPE_finite = Σ PV[t]  for t in 1..L`}</pre>
              <pre className="whitespace-pre-wrap">{`Perpetual:
PV_explicit = Σ PV[t] for t in 1..n
TV_at_n = OwnerCashFlow[n+1] / (r − gT)
PV_terminal = TV_at_n / (1 + r)^n
JustifiedPE = PV_explicit + PV_terminal`}</pre>
            </>
          ) : (
            <>
              <pre className="whitespace-pre-wrap">{`g1 = ROIC1 × RR1                 payout1 = 1 − RR1
g2 = ROIC2 × RR2                 payout2 = 1 − RR2

Earnings[t] = Earnings[t-1] × (1 + g_stage)
OwnerCashFlow[t] = Earnings[t] × payout_stage
PV[t] = OwnerCashFlow[t] / (1 + r)^t
JustifiedPE_finite = Σ PV[t] for t in 1..L`}</pre>
              <pre className="whitespace-pre-wrap">{`Perpetual:
PV_explicit = Σ PV[t] for t in 1..n
OwnerCashFlow[n+1] = Earnings[n] × (1 + g2) × payout2
TV_at_n = OwnerCashFlow[n+1] / (r − g2)
PV_terminal = TV_at_n / (1 + r)^n
JustifiedPE = PV_explicit + PV_terminal`}</pre>
            </>
          )}
          <pre className="whitespace-pre-wrap">{`Shareholder Wealth (Level 3):
FVPayout[t] = Payout[t] × (1 + ExtReturn)^(H − t)   if "reinvest externally"
EndingStockValue = Earnings[H] × ExitPE
EndingWealth = EndingStockValue + Σ FVPayout[t]
InvestorIRR = (EndingWealth / PurchasePrice)^(1/H) − 1`}</pre>
          <pre className="whitespace-pre-wrap">{`Margin of Safety:
MarginOfSafety = JustifiedPE / CurrentPE − 1
(positive: intrinsic value above market; negative: market above intrinsic value)`}</pre>
          <p className="text-ink-500 not-italic font-sans text-xs">
            Note: Company intrinsic value (Justified P/E) excludes external
            reinvestment of payouts. Shareholder Wealth includes external
            reinvestment of payouts.
          </p>
        </div>
      ) : (
        <p className="text-xs text-ink-500">
          Click show to view growth, payout, present value, terminal value and
          wealth formulas used by the model.
        </p>
      )}
    </Section>
  );
}
