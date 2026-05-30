import {
  fmtMultiple,
  fmtPercent,
  resolveDiscountRate,
  type ModelLevel,
  type AppMode,
  type ValuationAssumptions,
} from "../lib/valuation";
import { DerivedRow, NumberField, Section, SegmentedToggle } from "./primitives";

interface Props {
  assumptions: ValuationAssumptions;
  modelLevel: ModelLevel;
  mode: AppMode;
  setField: <K extends keyof ValuationAssumptions>(
    key: K,
    value: ValuationAssumptions[K],
  ) => void;
}

export function InputPanel({ assumptions, modelLevel, mode, setField }: Props) {
  const a = assumptions;
  const effectiveR = resolveDiscountRate(a);

  return (
    <div className="space-y-3">
      <Section title="Company / Market">
        <div className="grid grid-cols-1 gap-3">
          <NumberField
            label="Current market P/E"
            value={a.currentPE}
            onChange={(v) => setField("currentPE", v)}
            min={1}
            max={150}
            step={0.1}
            suffix="x"
            digits={1}
          />
          <NumberField
            label="Current earnings (EPS)"
            value={a.currentEarnings}
            onChange={(v) => setField("currentEarnings", v)}
            min={0.01}
            max={1000}
            step={0.01}
            digits={2}
            withSlider={false}
            hint="Normalized to 1.00 by default. Multiples are independent of this value."
          />
          <NumberField
            label="Business life"
            value={a.businessLife}
            onChange={(v) => setField("businessLife", Math.round(v))}
            min={5}
            max={150}
            step={1}
            suffix="yrs"
            digits={0}
          />
          <label className="flex items-center justify-between text-sm">
            <span className="text-xs font-medium uppercase tracking-wide text-ink-500">
              Perpetual business
            </span>
            <input
              type="checkbox"
              checked={a.perpetualBusiness}
              onChange={(e) => setField("perpetualBusiness", e.target.checked)}
              className="h-4 w-4 accent-ink-800"
            />
          </label>
        </div>
      </Section>

      <Section title="Discount Rate">
        <div className="space-y-3">
          <SegmentedToggle
            size="sm"
            value={a.discountRateMode}
            onChange={(v) => setField("discountRateMode", v)}
            options={[
              { value: "manual", label: "Manual" },
              { value: "treasuryPlusERP", label: "Treasury + ERP" },
            ]}
          />
          {a.discountRateMode === "manual" ? (
            <NumberField
              label="Discount rate"
              value={a.manualDiscountRate}
              onChange={(v) => setField("manualDiscountRate", v)}
              min={0.01}
              max={0.3}
              step={0.1}
              multiplier={100}
              suffix="%"
              digits={1}
            />
          ) : (
            <div className="space-y-3">
              <NumberField
                label="10Y Treasury yield"
                value={a.tenYearTreasuryYield}
                onChange={(v) => setField("tenYearTreasuryYield", v)}
                min={0}
                max={0.15}
                step={0.1}
                multiplier={100}
                suffix="%"
                digits={2}
              />
              <NumberField
                label="Equity risk premium"
                value={a.equityRiskPremium}
                onChange={(v) => setField("equityRiskPremium", v)}
                min={0}
                max={0.15}
                step={0.1}
                multiplier={100}
                suffix="%"
                digits={2}
              />
              <NumberField
                label="Specific risk premium"
                value={a.specificRiskPremium}
                onChange={(v) => setField("specificRiskPremium", v)}
                min={-0.05}
                max={0.1}
                step={0.1}
                multiplier={100}
                suffix="%"
                digits={2}
              />
              <DerivedRow
                label="Effective discount rate"
                value={fmtPercent(effectiveR, 2)}
              />
            </div>
          )}
        </div>
      </Section>

      {modelLevel === "simple" ? (
        <Section title="Simple Growth">
          <div className="space-y-3">
            <NumberField
              label="Stage 1 earnings growth"
              value={a.simpleGrowthRate}
              onChange={(v) => setField("simpleGrowthRate", v)}
              min={-0.1}
              max={0.3}
              step={0.1}
              multiplier={100}
              suffix="%"
              digits={1}
            />
            <NumberField
              label="Stage 1 duration"
              value={a.simpleDuration}
              onChange={(v) => setField("simpleDuration", Math.round(v))}
              min={0}
              max={50}
              step={1}
              suffix="yrs"
              digits={0}
            />
            <NumberField
              label="Terminal / mature growth"
              value={a.simpleTerminalGrowth}
              onChange={(v) => setField("simpleTerminalGrowth", v)}
              min={0}
              max={0.08}
              step={0.1}
              multiplier={100}
              suffix="%"
              digits={1}
            />
            <NumberField
              label="Payout ratio"
              value={a.simplePayoutRatio}
              onChange={(v) => setField("simplePayoutRatio", v)}
              min={0}
              max={1}
              step={0.1}
              multiplier={100}
              suffix="%"
              digits={1}
            />
          </div>
        </Section>
      ) : (
        <>
          <Section title="Stage 1 Economics">
            <div className="space-y-3">
              <NumberField
                label="Stage 1 ROIC"
                value={a.stage1ROIC}
                onChange={(v) => setField("stage1ROIC", v)}
                min={0}
                max={1}
                step={0.1}
                multiplier={100}
                suffix="%"
                digits={1}
              />
              <NumberField
                label="Stage 1 reinvestment rate"
                value={a.stage1ReinvestmentRate}
                onChange={(v) => setField("stage1ReinvestmentRate", v)}
                min={0}
                max={1}
                step={0.1}
                multiplier={100}
                suffix="%"
                digits={1}
              />
              <NumberField
                label="Stage 1 duration"
                value={a.stage1Duration}
                onChange={(v) => setField("stage1Duration", Math.round(v))}
                min={0}
                max={50}
                step={1}
                suffix="yrs"
                digits={0}
              />
              <DerivedRow
                label="Derived earnings growth"
                value={fmtPercent(a.stage1ROIC * a.stage1ReinvestmentRate)}
              />
              <DerivedRow
                label="Derived payout ratio"
                value={fmtPercent(1 - a.stage1ReinvestmentRate)}
              />
            </div>
          </Section>

          <Section title="Mature Economics">
            <div className="space-y-3">
              <NumberField
                label="Mature ROIC"
                value={a.matureROIC}
                onChange={(v) => setField("matureROIC", v)}
                min={0}
                max={0.5}
                step={0.1}
                multiplier={100}
                suffix="%"
                digits={1}
              />
              <NumberField
                label="Mature reinvestment rate"
                value={a.matureReinvestmentRate}
                onChange={(v) => setField("matureReinvestmentRate", v)}
                min={0}
                max={1}
                step={0.1}
                multiplier={100}
                suffix="%"
                digits={1}
              />
              <DerivedRow
                label="Derived mature growth"
                value={fmtPercent(a.matureROIC * a.matureReinvestmentRate)}
              />
              <DerivedRow
                label="Derived mature payout"
                value={fmtPercent(1 - a.matureReinvestmentRate)}
              />
            </div>
          </Section>
        </>
      )}

      {mode === "shareholderWealth" ? (
        <Section title="Shareholder Wealth">
          <div className="space-y-3">
            <NumberField
              label="Purchase P/E"
              value={a.purchasePE}
              onChange={(v) => setField("purchasePE", v)}
              min={1}
              max={100}
              step={0.1}
              suffix="x"
              digits={1}
            />
            <NumberField
              label="Exit P/E"
              value={a.exitPE}
              onChange={(v) => setField("exitPE", v)}
              min={0}
              max={100}
              step={0.1}
              suffix="x"
              digits={1}
            />
            <NumberField
              label="Holding period"
              value={a.holdingPeriod}
              onChange={(v) => setField("holdingPeriod", Math.round(v))}
              min={1}
              max={50}
              step={1}
              suffix="yrs"
              digits={0}
            />
            <NumberField
              label="External reinvestment return"
              value={a.externalReinvestmentReturn}
              onChange={(v) => setField("externalReinvestmentReturn", v)}
              min={0}
              max={0.2}
              step={0.1}
              multiplier={100}
              suffix="%"
              digits={1}
            />
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-ink-500">
                Payout treatment
              </span>
              <select
                className="mt-1 w-full text-sm border border-ink-200 rounded px-2 py-1 bg-white"
                value={a.payoutTreatment}
                onChange={(e) =>
                  setField(
                    "payoutTreatment",
                    e.target.value as ValuationAssumptions["payoutTreatment"],
                  )
                }
              >
                <option value="reinvestExternally">Reinvest externally</option>
                <option value="holdCash">Hold as cash</option>
                <option value="spend">Spend / distribute</option>
              </select>
            </label>
            <DerivedRow
              label="Multiple at purchase vs current market"
              value={`${fmtMultiple(a.purchasePE)} vs ${fmtMultiple(a.currentPE)}`}
            />
          </div>
        </Section>
      ) : null}
    </div>
  );
}
