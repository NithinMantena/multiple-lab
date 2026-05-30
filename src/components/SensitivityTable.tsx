import { useEffect, useMemo, useState } from "react";
import {
  buildSensitivityTable,
  defaultRangeFor,
  fmtMultiple,
  fmtPercent,
  fmtSignedPercent,
  type AppMode,
  type ModelLevel,
  type SensitivityCellMetric,
  type SensitivityConfig,
  type SensitivityVariable,
  type ValuationAssumptions,
} from "../lib/valuation";
import { Section, SegmentedToggle } from "./primitives";

interface Props {
  assumptions: ValuationAssumptions;
  level: ModelLevel;
  mode: AppMode;
}

const VAR_LABELS: Record<SensitivityVariable, string> = {
  simpleGrowthRate: "Stage 1 growth",
  simpleDuration: "Stage 1 duration",
  stage1ROIC: "Stage 1 ROIC",
  stage1ReinvestmentRate: "Stage 1 reinvestment rate",
  stage1Duration: "Stage 1 duration",
  matureROIC: "Mature ROIC",
  matureReinvestmentRate: "Mature reinvestment rate",
  discountRate: "Discount rate",
  matureTerminalGrowth: "Mature / terminal growth",
  businessLife: "Business life",
  exitPE: "Exit P/E",
  externalReinvestmentReturn: "External reinvestment return",
};

const METRIC_LABELS: Record<SensitivityCellMetric, string> = {
  justifiedPE: "Justified P/E",
  marginOfSafetyPercent: "Margin of safety %",
  investorIRR: "Investor IRR",
  endingWealth: "Ending wealth",
};

const ROW_OPTIONS_BY_LEVEL: Record<ModelLevel, SensitivityVariable[]> = {
  simple: ["simpleGrowthRate", "simpleDuration", "matureTerminalGrowth", "discountRate", "businessLife"],
  roic: ["stage1ROIC", "stage1ReinvestmentRate", "stage1Duration", "matureROIC", "matureReinvestmentRate", "discountRate", "businessLife"],
  wealth: ["stage1ROIC", "stage1ReinvestmentRate", "exitPE", "externalReinvestmentReturn", "discountRate"],
};

function defaultsFor(level: ModelLevel, mode: AppMode): {
  metric: SensitivityCellMetric;
  rowVar: SensitivityVariable;
  colVar: SensitivityVariable;
} {
  if (mode === "shareholderWealth")
    return {
      metric: "investorIRR",
      rowVar: "externalReinvestmentReturn",
      colVar: "exitPE",
    };
  if (level === "simple")
    return {
      metric: "justifiedPE",
      rowVar: "simpleGrowthRate",
      colVar: "simpleDuration",
    };
  return {
    metric: "justifiedPE",
    rowVar: "stage1ROIC",
    colVar: "stage1ReinvestmentRate",
  };
}

function formatCell(metric: SensitivityCellMetric, v: number): string {
  if (!isFinite(v)) return "—";
  if (metric === "justifiedPE") return fmtMultiple(v);
  if (metric === "investorIRR") return fmtPercent(v, 1);
  if (metric === "endingWealth") return `$${v.toFixed(2)}`;
  return fmtSignedPercent(v);
}

function formatAxis(v: SensitivityVariable, x: number): string {
  switch (v) {
    case "simpleGrowthRate":
    case "stage1ROIC":
    case "matureROIC":
    case "stage1ReinvestmentRate":
    case "matureReinvestmentRate":
    case "discountRate":
    case "matureTerminalGrowth":
    case "externalReinvestmentReturn":
      return fmtPercent(x, 0);
    case "simpleDuration":
    case "stage1Duration":
    case "businessLife":
      return `${Math.round(x)}y`;
    case "exitPE":
      return fmtMultiple(x);
    default:
      return String(x);
  }
}

export function SensitivityTable({ assumptions, level, mode }: Props) {
  const initial = useMemo(() => defaultsFor(level, mode), [level, mode]);
  const [metric, setMetric] = useState<SensitivityCellMetric>(initial.metric);
  const [rowVar, setRowVar] = useState<SensitivityVariable>(initial.rowVar);
  const [colVar, setColVar] = useState<SensitivityVariable>(initial.colVar);
  useEffect(() => {
    setMetric(initial.metric);
    setRowVar(initial.rowVar);
    setColVar(initial.colVar);
  }, [initial.metric, initial.rowVar, initial.colVar]);

  const rowOptions = ROW_OPTIONS_BY_LEVEL[level];
  const colOptions = rowOptions.filter((v) => v !== rowVar);

  const config: SensitivityConfig = useMemo(() => {
    const rowValues = defaultRangeFor(rowVar, assumptions);
    const colValues = defaultRangeFor(colVar === rowVar ? colOptions[0] : colVar, assumptions);
    return {
      level: mode === "shareholderWealth" ? "wealth" : level,
      metric,
      rowVar,
      colVar: colVar === rowVar ? colOptions[0] : colVar,
      rowValues,
      colValues,
    };
  }, [assumptions, level, mode, metric, rowVar, colVar, colOptions]);

  const table = useMemo(
    () => buildSensitivityTable(assumptions, config),
    [assumptions, config],
  );

  const onCopy = async () => {
    const lines: string[] = [];
    const headerLine = [VAR_LABELS[rowVar], ...table.cols.map((c) => formatAxis(config.colVar, c))].join("\t");
    lines.push(headerLine);
    for (let i = 0; i < table.rows.length; i++) {
      const row = [formatAxis(rowVar, table.rows[i]), ...table.cells[i].map((c) => formatCell(metric, c))];
      lines.push(row.join("\t"));
    }
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
    } catch {
      /* ignore */
    }
  };

  const metricOptions: { value: SensitivityCellMetric; label: string }[] =
    mode === "shareholderWealth"
      ? [
          { value: "investorIRR", label: "Investor IRR" },
          { value: "endingWealth", label: "Ending wealth" },
        ]
      : [
          { value: "justifiedPE", label: "Justified P/E" },
          { value: "marginOfSafetyPercent", label: "Margin of safety %" },
        ];

  const currentPE = assumptions.currentPE;

  return (
    <Section
      title="Sensitivity"
      right={
        <div className="flex items-center gap-2">
          <SegmentedToggle
            size="sm"
            value={metric}
            onChange={setMetric}
            options={metricOptions}
          />
          <button
            type="button"
            onClick={onCopy}
            className="text-xs px-2 py-1 rounded border border-ink-200 text-ink-600 hover:bg-ink-50"
          >
            Copy
          </button>
        </div>
      }
    >
      <div className="flex flex-wrap gap-3 mb-3 text-xs">
        <label className="flex items-center gap-1.5">
          <span className="text-ink-500">Rows</span>
          <select
            className="border border-ink-200 rounded px-1.5 py-0.5"
            value={rowVar}
            onChange={(e) => setRowVar(e.target.value as SensitivityVariable)}
          >
            {rowOptions.map((v) => (
              <option key={v} value={v}>
                {VAR_LABELS[v]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-1.5">
          <span className="text-ink-500">Cols</span>
          <select
            className="border border-ink-200 rounded px-1.5 py-0.5"
            value={colVar}
            onChange={(e) => setColVar(e.target.value as SensitivityVariable)}
          >
            {colOptions.map((v) => (
              <option key={v} value={v}>
                {VAR_LABELS[v]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm tabular-nums border-collapse">
          <thead>
            <tr>
              <th className="text-left text-xs text-ink-500 font-medium px-2 py-1 border-b border-ink-100">
                {VAR_LABELS[config.rowVar]} \ {VAR_LABELS[config.colVar]}
              </th>
              {table.cols.map((c, idx) => (
                <th
                  key={idx}
                  className="text-right text-xs font-medium text-ink-500 px-2 py-1 border-b border-ink-100"
                >
                  {formatAxis(config.colVar, c)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.cells.map((row, i) => (
              <tr key={i} className="hover:bg-ink-50/40">
                <th className="text-left font-medium text-ink-600 text-xs px-2 py-1 border-b border-ink-50">
                  {formatAxis(config.rowVar, table.rows[i])}
                </th>
                {row.map((c, j) => {
                  let toneClass = "";
                  if (metric === "justifiedPE" && isFinite(c)) {
                    if (c > currentPE * 1.05)
                      toneClass = "bg-emerald-50/60 text-emerald-900";
                    else if (c < currentPE * 0.95)
                      toneClass = "bg-red-50/60 text-red-900";
                  }
                  return (
                    <td
                      key={j}
                      className={`text-right px-2 py-1 border-b border-ink-50 ${toneClass}`}
                    >
                      {formatCell(metric, c)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}
