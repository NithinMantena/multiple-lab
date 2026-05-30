import { useMemo, useState } from "react";
import {
  fmtMultiple,
  fmtPercent,
  solveImpliedAssumption,
  type ModelLevel,
  type SolveTarget,
  type ValuationAssumptions,
} from "../lib/valuation";
import { Pill, Section } from "./primitives";

interface Props {
  assumptions: ValuationAssumptions;
  level: ModelLevel;
}

const TARGETS_BY_LEVEL: Record<
  Exclude<ModelLevel, "wealth">,
  { value: SolveTarget; label: string }[]
> = {
  simple: [
    { value: "simpleGrowthRate", label: "Required Stage 1 earnings growth" },
    { value: "simpleDuration", label: "Required Stage 1 duration" },
    { value: "discountRate", label: "Required discount rate" },
  ],
  roic: [
    { value: "stage1ROIC", label: "Required Stage 1 ROIC" },
    {
      value: "stage1ReinvestmentRate",
      label: "Required Stage 1 reinvestment rate",
    },
    { value: "stage1Duration", label: "Required Stage 1 duration" },
    { value: "matureROIC", label: "Required mature ROIC" },
    {
      value: "matureReinvestmentRate",
      label: "Required mature reinvestment rate",
    },
    { value: "discountRate", label: "Required discount rate" },
  ],
};

function formatResult(target: SolveTarget, value: number): string {
  if (!isFinite(value)) return "—";
  switch (target) {
    case "simpleGrowthRate":
    case "discountRate":
    case "stage1ROIC":
    case "stage1ReinvestmentRate":
    case "matureROIC":
    case "matureReinvestmentRate":
    case "externalReinvestmentReturn":
      return fmtPercent(value, 1);
    case "simpleDuration":
    case "stage1Duration":
      return `${value.toFixed(1)} yrs`;
    case "exitPE":
    case "purchasePE":
    case "wealthStage1ROIC":
      return fmtMultiple(value, 1);
    default:
      return value.toFixed(3);
  }
}

export function SolverPanel({ assumptions, level }: Props) {
  const targets =
    level === "wealth" ? TARGETS_BY_LEVEL.roic : TARGETS_BY_LEVEL[level];
  const [target, setTarget] = useState<SolveTarget>(targets[0].value);

  const result = useMemo(
    () =>
      solveImpliedAssumption(assumptions, {
        target,
        desiredValue: assumptions.currentPE,
        level: level === "wealth" ? "roic" : level,
      }),
    [assumptions, target, level],
  );

  const targetLabel = targets.find((t) => t.value === target)?.label ?? "";

  return (
    <Section title="Implied Assumptions">
      <p className="text-xs text-ink-500 mb-2">
        Holding all other assumptions fixed, solve for the variable that makes
        the justified P/E equal the current market P/E ({fmtMultiple(assumptions.currentPE)}).
      </p>
      <div className="space-y-3">
        <label className="block text-xs">
          <span className="text-ink-500">Solve for</span>
          <select
            className="mt-1 w-full text-sm border border-ink-200 rounded px-2 py-1 bg-white"
            value={target}
            onChange={(e) => setTarget(e.target.value as SolveTarget)}
          >
            {targets.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <div>
          {result.ok ? (
            <>
              <p className="text-xs uppercase tracking-wide text-ink-500">
                {targetLabel}
              </p>
              <p className="text-3xl font-semibold tabular-nums">
                {formatResult(target, result.value)}
              </p>
              <p className="text-xs text-ink-500 mt-1">
                For {fmtMultiple(assumptions.currentPE)} P/E to be fair.{" "}
                Solved in {result.iterations} iterations.
              </p>
              {result.message ? (
                <Pill tone="warn">{result.message}</Pill>
              ) : null}
            </>
          ) : (
            <Pill tone="error">{result.message ?? "No solution found."}</Pill>
          )}
        </div>
      </div>
    </Section>
  );
}
