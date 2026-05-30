import { useAssumptions } from "./hooks/useAssumptions";
import { useValuation } from "./hooks/useValuation";
import { AppHeader } from "./components/Header";
import { Intro } from "./components/Intro";
import { InputPanel } from "./components/InputPanel";
import { KeyOutputs } from "./components/KeyOutputs";
import { ExplanationText } from "./components/ExplanationText";
import type { ComponentProps } from "react";
import { SensitivityTable } from "./components/SensitivityTable";
import {
  EarningsAndCashflowChart,
  ValueByPeriodChart,
  WealthAttributionChart,
} from "./components/Charts";
import { SolverPanel } from "./components/SolverPanel";
import { YearlyTable } from "./components/YearlyTable";
import { FormulaDisclosure } from "./components/FormulaDisclosure";
import { SegmentedToggle } from "./components/primitives";
import {
  buildSummary,
  downloadFile,
  rowsToCSV,
} from "./lib/exporters";

export default function App() {
  const {
    assumptions,
    modelLevel,
    mode,
    view,
    hasSeenIntro,
    setField,
    setModelLevel,
    setMode,
    setView,
    resetToDefaults,
    saveAsDefaults,
  } = useAssumptions();
  const bundle = useValuation(assumptions, modelLevel);

  if (view === "intro") {
    return (
      <Intro
        onStart={() => setView("calculator")}
        alreadySeen={hasSeenIntro}
      />
    );
  }

  const isWealth = mode === "shareholderWealth";
  const yearlyRows = isWealth
    ? bundle.wealth.yearlyRows
    : bundle.valuation.yearlyRows;

  const onExportYearly = () => {
    const csv = rowsToCSV(yearlyRows, isWealth);
    downloadFile(`multiple-lab-yearly-${Date.now()}.csv`, csv);
  };

  const onCopySummary = async () => {
    const summary = buildSummary(
      assumptions,
      bundle.valuation,
      modelLevel,
      bundle.effectiveDiscountRate,
      bundle.wealth,
    );
    try {
      await navigator.clipboard.writeText(summary);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="min-h-screen bg-ink-50/30">
      <AppHeader
        onReset={resetToDefaults}
        onSaveDefaults={saveAsDefaults}
        onShowIntro={() => setView("intro")}
      />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-500">Model</span>
            <SegmentedToggle
              value={modelLevel}
              onChange={setModelLevel}
              options={[
                { value: "simple", label: "Simple" },
                { value: "roic", label: "ROIC / Reinvestment" },
                { value: "wealth", label: "Wealth" },
              ]}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-500">Mode</span>
            <SegmentedToggle
              value={mode}
              onChange={setMode}
              options={[
                { value: "justifiedMultiple", label: "Justified Multiple" },
                { value: "impliedAssumptions", label: "Implied Assumptions" },
                { value: "shareholderWealth", label: "Shareholder Wealth" },
              ]}
            />
          </div>
          <div className="ml-auto">
            <button
              onClick={onCopySummary}
              className="text-xs px-2.5 py-1 rounded border border-ink-200 text-ink-600 hover:bg-ink-50"
            >
              Copy summary
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-4">
          <aside className="space-y-3 order-2 lg:order-1">
            <InputPanel
              assumptions={assumptions}
              modelLevel={modelLevel}
              mode={mode}
              setField={setField}
            />
          </aside>

          <main className="space-y-3 order-1 lg:order-2">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              <KeyOutputs
                bundle={bundle}
                assumptions={assumptions}
                mode={mode}
                level={modelLevel}
              />
              {mode === "impliedAssumptions" && modelLevel !== "wealth" ? (
                <SolverPanel
                  assumptions={assumptions}
                  level={modelLevel}
                />
              ) : (
                <ExplanationWrap
                  bundle={bundle}
                  assumptions={assumptions}
                  level={modelLevel}
                  mode={mode}
                />
              )}
            </div>

            {mode === "impliedAssumptions" && modelLevel !== "wealth" ? (
              <ExplanationWrap
                bundle={bundle}
                assumptions={assumptions}
                level={modelLevel}
                mode={mode}
              />
            ) : null}

            <SensitivityTable
              assumptions={assumptions}
              level={modelLevel}
              mode={mode}
            />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              {isWealth ? (
                <WealthAttributionChart
                  bundle={bundle}
                  assumptions={assumptions}
                />
              ) : (
                <ValueByPeriodChart
                  bundle={bundle}
                  perpetual={assumptions.perpetualBusiness}
                />
              )}
              <EarningsAndCashflowChart bundle={bundle} />
            </div>

            <YearlyTable
              rows={yearlyRows}
              isWealth={isWealth}
              onExportCSV={onExportYearly}
            />

            <FormulaDisclosure level={modelLevel} />
          </main>
        </div>

        <footer className="mt-6 mb-2 text-[11px] text-ink-400 leading-snug">
          Company Value excludes external reinvestment of payouts. Shareholder
          Wealth includes external reinvestment of payouts. All calculations
          run client-side; assumptions persist in this browser only.
        </footer>
      </div>
    </div>
  );
}

function ExplanationWrap(props: ComponentProps<typeof ExplanationText>) {
  return (
    <div className="rounded-md border border-ink-200 bg-white p-4">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-500 mb-2">
        Summary
      </h2>
      <ExplanationText {...props} />
    </div>
  );
}
