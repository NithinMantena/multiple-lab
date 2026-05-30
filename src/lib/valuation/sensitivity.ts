import { calculateROICModel } from "./roicModel";
import { calculateSimpleModel } from "./simpleModel";
import { calculateWealthModel } from "./wealthModel";
import type { ValuationAssumptions } from "./types";

export type SensitivityVariable =
  | "simpleGrowthRate"
  | "simpleDuration"
  | "stage1ROIC"
  | "stage1ReinvestmentRate"
  | "stage1Duration"
  | "matureROIC"
  | "matureReinvestmentRate"
  | "discountRate"
  | "matureTerminalGrowth"
  | "businessLife"
  | "exitPE"
  | "externalReinvestmentReturn";

export type SensitivityCellMetric =
  | "justifiedPE"
  | "impliedGapPercent"
  | "investorIRR"
  | "endingWealth";

export interface SensitivityConfig {
  level: "simple" | "roic" | "wealth";
  metric: SensitivityCellMetric;
  rowVar: SensitivityVariable;
  colVar: SensitivityVariable;
  rowValues: number[];
  colValues: number[];
}

export interface SensitivityTable {
  config: SensitivityConfig;
  rows: number[];
  cols: number[];
  cells: number[][];
  basePoint?: { rowIdx: number; colIdx: number };
}

function applyVar(
  a: ValuationAssumptions,
  v: SensitivityVariable,
  value: number,
): ValuationAssumptions {
  const next = { ...a };
  switch (v) {
    case "simpleGrowthRate":
      next.simpleGrowthRate = value;
      break;
    case "simpleDuration":
      next.simpleDuration = value;
      break;
    case "stage1ROIC":
      next.stage1ROIC = value;
      break;
    case "stage1ReinvestmentRate":
      next.stage1ReinvestmentRate = value;
      break;
    case "stage1Duration":
      next.stage1Duration = value;
      break;
    case "matureROIC":
      next.matureROIC = value;
      break;
    case "matureReinvestmentRate":
      next.matureReinvestmentRate = value;
      break;
    case "discountRate":
      next.discountRateMode = "manual";
      next.manualDiscountRate = value;
      break;
    case "matureTerminalGrowth":
      next.simpleTerminalGrowth = value;
      break;
    case "businessLife":
      next.businessLife = value;
      break;
    case "exitPE":
      next.exitPE = value;
      break;
    case "externalReinvestmentReturn":
      next.externalReinvestmentReturn = value;
      break;
  }
  return next;
}

function compute(
  a: ValuationAssumptions,
  level: "simple" | "roic" | "wealth",
  metric: SensitivityCellMetric,
): number {
  if (metric === "investorIRR" || metric === "endingWealth") {
    const result = calculateWealthModel(a);
    if (result.errors.length > 0) return NaN;
    return metric === "investorIRR" ? result.investorIRR : result.endingWealth;
  }
  const r =
    level === "simple"
      ? calculateSimpleModel(a)
      : level === "roic"
      ? calculateROICModel(a)
      : calculateROICModel(a);
  if (r.errors.length > 0) return NaN;
  return metric === "justifiedPE" ? r.justifiedPE : r.impliedGapPercent;
}

export function buildSensitivityTable(
  base: ValuationAssumptions,
  config: SensitivityConfig,
): SensitivityTable {
  const cells: number[][] = [];
  for (const rowValue of config.rowValues) {
    const cellRow: number[] = [];
    for (const colValue of config.colValues) {
      let scenario = applyVar(base, config.rowVar, rowValue);
      scenario = applyVar(scenario, config.colVar, colValue);
      cellRow.push(compute(scenario, config.level, config.metric));
    }
    cells.push(cellRow);
  }
  return { config, rows: config.rowValues, cols: config.colValues, cells };
}

export function defaultRangeFor(
  v: SensitivityVariable,
  base: ValuationAssumptions,
): number[] {
  switch (v) {
    case "simpleGrowthRate":
      return [0.04, 0.06, 0.08, 0.1, 0.12, 0.15];
    case "simpleDuration":
      return [5, 10, 15, 20, 25, 30];
    case "stage1ROIC":
      return [0.1, 0.15, 0.2, 0.25, 0.3, 0.4];
    case "stage1ReinvestmentRate":
      return [0.2, 0.4, 0.6, 0.8];
    case "stage1Duration":
      return [5, 10, 15, 20];
    case "matureROIC":
      return [0.08, 0.1, 0.12, 0.15];
    case "matureReinvestmentRate":
      return [0.15, 0.25, 0.35, 0.45];
    case "discountRate":
      return [0.07, 0.08, 0.09, 0.1, 0.11];
    case "matureTerminalGrowth":
      return [0.01, 0.02, 0.03, 0.04];
    case "businessLife":
      return [30, 50, 70, 100];
    case "exitPE":
      return [10, 15, 20, 25, 30];
    case "externalReinvestmentReturn":
      return [0.04, 0.06, 0.08, 0.1, 0.12];
    default:
      return [base.currentPE];
  }
}
