import {
  discountToIntrinsic,
  fmtDollar,
  fmtMultiple,
  fmtPercent,
  fmtSignedPercent,
  type AppMode,
  type ModelLevel,
  type ValuationAssumptions,
} from "../lib/valuation";
import type { ValuationBundle } from "../hooks/useValuation";
import { Pill, Section } from "./primitives";

interface Props {
  bundle: ValuationBundle;
  assumptions: ValuationAssumptions;
  mode: AppMode;
  level: ModelLevel;
}

export function KeyOutputs({ bundle, assumptions, mode, level }: Props) {
  if (mode === "shareholderWealth") {
    const { wealth } = bundle;
    if (wealth.errors.length > 0) {
      return (
        <Section title="Investor IRR">
          <div className="space-y-2">
            {wealth.errors.map((e, i) => (
              <Pill key={i} tone="error">
                {e}
              </Pill>
            ))}
          </div>
        </Section>
      );
    }
    const intrinsicPE = bundle.valuation.justifiedPE;
    const purchaseDiscount = discountToIntrinsic(intrinsicPE, assumptions.purchasePE);
    const purchaseTone: "good" | "error" | "neutral" = !isFinite(purchaseDiscount)
      ? "neutral"
      : Math.abs(purchaseDiscount) < 0.02
      ? "neutral"
      : purchaseDiscount > 0
      ? "good"
      : "error";
    const purchaseLabel = !isFinite(purchaseDiscount)
      ? "—"
      : purchaseDiscount >= 0
      ? "Discount to intrinsic"
      : "Premium to intrinsic";
    return (
      <Section title="Investor Wealth">
        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-500">
              Investor IRR
            </p>
            <p className="text-4xl font-semibold tabular-nums">
              {fmtPercent(wealth.investorIRR, 2)}
            </p>
          </div>

          <div className="rounded-md bg-ink-50/60 border border-ink-200 p-3">
            <p className="text-xs uppercase tracking-wide text-ink-500 mb-1.5">
              Purchase price vs intrinsic value
            </p>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <Stat
                label="Purchase P/E"
                value={fmtMultiple(assumptions.purchasePE)}
              />
              <Stat
                label="Intrinsic P/E"
                value={fmtMultiple(intrinsicPE)}
                hint="From your ROIC assumptions"
              />
              <div>
                <p className="text-xs text-ink-500">{purchaseLabel}</p>
                <p
                  className={`tabular-nums font-semibold ${
                    purchaseTone === "good"
                      ? "text-emerald-700"
                      : purchaseTone === "error"
                      ? "text-red-700"
                      : "text-ink-800"
                  }`}
                >
                  {fmtSignedPercent(purchaseDiscount, 1)}
                </p>
              </div>
            </div>
            {bundle.valuation.errors.length === 0 ? (
              <p className="text-[11px] text-ink-500 mt-2 leading-snug">
                Intrinsic value reflects the company's distributable cash at
                current ROIC / reinvestment / discount-rate assumptions and
                excludes external reinvestment of payouts.
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <Stat
              label="Ending wealth"
              value={fmtDollar(wealth.endingWealth, 2)}
              hint={`per ${fmtDollar(assumptions.currentEarnings)} of starting earnings`}
            />
            <Stat
              label="Ending stock value"
              value={fmtDollar(wealth.endingStockValue, 2)}
            />
            <Stat
              label="FV of payouts"
              value={fmtDollar(wealth.fvOfPayouts, 2)}
            />
            <Stat
              label="Raw payouts received"
              value={fmtDollar(wealth.rawPayouts, 2)}
            />
            <Stat
              label="External reinvestment gain"
              value={fmtDollar(wealth.externalReinvestmentGain, 2)}
            />
            <Stat
              label="Multiple change effect"
              value={fmtDollar(wealth.multipleChangeValue, 2)}
            />
          </div>
          {wealth.warnings.length > 0 ? (
            <div className="space-y-1">
              {wealth.warnings.map((w, i) => (
                <Pill key={i} tone="warn">
                  {w}
                </Pill>
              ))}
            </div>
          ) : null}
        </div>
      </Section>
    );
  }

  const { valuation } = bundle;
  if (valuation.errors.length > 0) {
    return (
      <Section title="Justified Multiple">
        <div className="space-y-2">
          {valuation.errors.map((e, i) => (
            <Pill key={i} tone="error">
              {e}
            </Pill>
          ))}
        </div>
      </Section>
    );
  }
  const discount = discountToIntrinsic(
    valuation.justifiedPE,
    valuation.currentPE,
  );
  const discountTone: "good" | "error" | "neutral" = !isFinite(discount)
    ? "neutral"
    : Math.abs(discount) < 0.02
    ? "neutral"
    : discount > 0
    ? "good"
    : "error";
  const discountLabel = !isFinite(discount)
    ? "—"
    : discount >= 0
    ? "Discount to intrinsic"
    : "Premium to intrinsic";

  return (
    <Section title="Justified Multiple">
      <div className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-500">
            Justified P/E
          </p>
          <p className="text-4xl font-semibold tabular-nums">
            {fmtMultiple(valuation.justifiedPE, 1)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Stat label="Current P/E" value={fmtMultiple(valuation.currentPE)} />
          <Pill tone={discountTone}>
            {discountLabel} {fmtSignedPercent(discount)}
          </Pill>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {level === "simple" ? (
            <>
              <Stat
                label="Stage 1 growth"
                value={fmtPercent(valuation.stage1Growth)}
              />
              <Stat
                label="Payout ratio"
                value={fmtPercent(valuation.stage1PayoutRatio)}
              />
              <Stat
                label="Terminal growth"
                value={fmtPercent(valuation.matureGrowth)}
              />
            </>
          ) : (
            <>
              <Stat
                label="Stage 1 growth"
                value={fmtPercent(valuation.stage1Growth)}
              />
              <Stat
                label="Stage 1 payout"
                value={fmtPercent(valuation.stage1PayoutRatio)}
              />
              <Stat
                label="Mature growth"
                value={fmtPercent(valuation.matureGrowth)}
              />
              <Stat
                label="Mature payout"
                value={fmtPercent(valuation.maturePayoutRatio)}
              />
            </>
          )}
          <Stat
            label="Value from Stage 1"
            value={fmtMultiple(valuation.pvStage1 / assumptions.currentEarnings)}
          />
          <Stat
            label="Value from Mature"
            value={fmtMultiple(
              valuation.pvMatureStage / assumptions.currentEarnings,
            )}
          />
          {assumptions.perpetualBusiness ? (
            <Stat
              label="Terminal value"
              value={fmtMultiple(
                valuation.pvTerminalValue / assumptions.currentEarnings,
              )}
            />
          ) : null}
          <Stat
            label="Effective discount"
            value={fmtPercent(bundle.effectiveDiscountRate, 2)}
          />
        </div>
        {valuation.warnings.length > 0 ? (
          <div className="space-y-1">
            {valuation.warnings.map((w, i) => (
              <Pill key={i} tone="warn">
                {w}
              </Pill>
            ))}
          </div>
        ) : null}
      </div>
    </Section>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div>
      <p className="text-xs text-ink-500">{label}</p>
      <p className="tabular-nums font-medium text-ink-800">{value}</p>
      {hint ? <p className="text-[10px] text-ink-400">{hint}</p> : null}
    </div>
  );
}
