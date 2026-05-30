import { useMemo } from "react";
import {
  calculateROICModel,
  calculateSimpleModel,
  calculateWealthModel,
  resolveDiscountRate,
  type ModelLevel,
  type ValuationAssumptions,
  type ValuationResult,
  type WealthResult,
} from "../lib/valuation";

export interface ValuationBundle {
  valuation: ValuationResult;
  wealth: WealthResult;
  effectiveDiscountRate: number;
}

export function useValuation(
  assumptions: ValuationAssumptions,
  level: ModelLevel,
): ValuationBundle {
  return useMemo(() => {
    const valuation =
      level === "simple"
        ? calculateSimpleModel(assumptions)
        : calculateROICModel(assumptions);
    const wealth = calculateWealthModel(assumptions);
    return {
      valuation,
      wealth,
      effectiveDiscountRate: resolveDiscountRate(assumptions),
    };
  }, [assumptions, level]);
}
