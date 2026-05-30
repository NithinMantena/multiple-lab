import { calculateROICModel } from "./roicModel";
import { calculateSimpleModel } from "./simpleModel";
import { calculateWealthModel } from "./wealthModel";
import type { ValuationAssumptions } from "./types";

export type SolveTarget =
  | "simpleGrowthRate"
  | "simpleDuration"
  | "discountRate"
  | "stage1ROIC"
  | "stage1ReinvestmentRate"
  | "stage1Duration"
  | "matureROIC"
  | "matureReinvestmentRate"
  | "exitPE"
  | "purchasePE"
  | "externalReinvestmentReturn"
  | "wealthStage1ROIC";

export interface SolveResult {
  ok: boolean;
  value: number;
  iterations: number;
  message?: string;
}

export interface SolveOptions {
  target: SolveTarget;
  desiredValue: number;
  level: "simple" | "roic" | "wealth";
  lower?: number;
  upper?: number;
  tolerance?: number;
  maxIterations?: number;
}

const DEFAULT_BOUNDS: Record<SolveTarget, [number, number]> = {
  simpleGrowthRate: [-0.2, 0.5],
  simpleDuration: [0, 100],
  discountRate: [0.01, 0.3],
  stage1ROIC: [0, 1.5],
  stage1ReinvestmentRate: [0, 1],
  stage1Duration: [0, 100],
  matureROIC: [0, 0.5],
  matureReinvestmentRate: [0, 1],
  exitPE: [0.1, 200],
  purchasePE: [0.1, 200],
  externalReinvestmentReturn: [-0.1, 0.3],
  wealthStage1ROIC: [0, 1.5],
};

function applyTarget(
  a: ValuationAssumptions,
  target: SolveTarget,
  value: number,
): ValuationAssumptions {
  const next = { ...a };
  switch (target) {
    case "simpleGrowthRate":
      next.simpleGrowthRate = value;
      break;
    case "simpleDuration":
      next.simpleDuration = value;
      break;
    case "discountRate":
      next.discountRateMode = "manual";
      next.manualDiscountRate = value;
      break;
    case "stage1ROIC":
    case "wealthStage1ROIC":
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
    case "exitPE":
      next.exitPE = value;
      break;
    case "purchasePE":
      next.purchasePE = value;
      break;
    case "externalReinvestmentReturn":
      next.externalReinvestmentReturn = value;
      break;
  }
  return next;
}

function evaluate(
  a: ValuationAssumptions,
  level: "simple" | "roic" | "wealth",
  target: SolveTarget,
  value: number,
  desired: number,
): number {
  const next = applyTarget(a, target, value);
  if (level === "wealth") {
    const result = calculateWealthModel(next);
    if (result.errors.length > 0) return NaN;
    return result.investorIRR - desired;
  }
  const result =
    level === "simple"
      ? calculateSimpleModel(next)
      : calculateROICModel(next);
  if (result.errors.length > 0) return NaN;
  return result.justifiedPE - desired;
}

export function solveImpliedAssumption(
  a: ValuationAssumptions,
  options: SolveOptions,
): SolveResult {
  const [defaultLower, defaultUpper] = DEFAULT_BOUNDS[options.target];
  let lo = options.lower ?? defaultLower;
  let hi = options.upper ?? defaultUpper;
  const tolerance = options.tolerance ?? 0.001;
  const maxIter = options.maxIterations ?? 100;

  if (options.target === "stage1Duration") {
    hi = Math.min(hi, a.businessLife);
  }

  let fLo = evaluate(a, options.level, options.target, lo, options.desiredValue);
  let fHi = evaluate(a, options.level, options.target, hi, options.desiredValue);

  if (!isFinite(fLo) || !isFinite(fHi)) {
    return {
      ok: false,
      value: NaN,
      iterations: 0,
      message:
        "No realistic solution found within the selected bounds. Try changing the business life, terminal growth, discount rate, or solve target.",
    };
  }

  if (fLo * fHi > 0) {
    return {
      ok: false,
      value: NaN,
      iterations: 0,
      message:
        "No realistic solution found within the selected bounds. Try changing the business life, terminal growth, discount rate, or solve target.",
    };
  }

  let mid = lo;
  for (let i = 0; i < maxIter; i++) {
    mid = (lo + hi) / 2;
    const fMid = evaluate(
      a,
      options.level,
      options.target,
      mid,
      options.desiredValue,
    );
    if (!isFinite(fMid))
      return {
        ok: false,
        value: NaN,
        iterations: i,
        message: "Solver hit a region where the model is undefined.",
      };
    if (Math.abs(fMid) < tolerance || (hi - lo) / 2 < 1e-7) {
      return { ok: true, value: mid, iterations: i + 1 };
    }
    if (fMid * fLo < 0) {
      hi = mid;
      fHi = fMid;
    } else {
      lo = mid;
      fLo = fMid;
    }
  }
  return {
    ok: true,
    value: mid,
    iterations: maxIter,
    message: "Reached max iterations; result is approximate.",
  };
}
