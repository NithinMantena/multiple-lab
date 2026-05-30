import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_ASSUMPTIONS,
  type ValuationAssumptions,
  type ModelLevel,
  type AppMode,
} from "../lib/valuation";

const STORAGE_KEY = "multiple-lab:state:v1";

interface PersistedState {
  assumptions: ValuationAssumptions;
  modelLevel: ModelLevel;
  mode: AppMode;
  defaults?: Partial<ValuationAssumptions>;
}

function loadInitial(): PersistedState {
  if (typeof window === "undefined") {
    return {
      assumptions: DEFAULT_ASSUMPTIONS,
      modelLevel: "roic",
      mode: "justifiedMultiple",
    };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        assumptions: DEFAULT_ASSUMPTIONS,
        modelLevel: "roic",
        mode: "justifiedMultiple",
      };
    }
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      assumptions: { ...DEFAULT_ASSUMPTIONS, ...(parsed.assumptions ?? {}) },
      modelLevel: parsed.modelLevel ?? "roic",
      mode: parsed.mode ?? "justifiedMultiple",
      defaults: parsed.defaults,
    };
  } catch {
    return {
      assumptions: DEFAULT_ASSUMPTIONS,
      modelLevel: "roic",
      mode: "justifiedMultiple",
    };
  }
}

export function useAssumptions() {
  const [state, setState] = useState<PersistedState>(loadInitial);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  const setField = useCallback(
    <K extends keyof ValuationAssumptions>(
      key: K,
      value: ValuationAssumptions[K],
    ) => {
      setState((prev) => ({
        ...prev,
        assumptions: { ...prev.assumptions, [key]: value },
      }));
    },
    [],
  );

  const setAssumptions = useCallback(
    (next: Partial<ValuationAssumptions>) => {
      setState((prev) => ({
        ...prev,
        assumptions: { ...prev.assumptions, ...next },
      }));
    },
    [],
  );

  const setModelLevel = useCallback((level: ModelLevel) => {
    setState((prev) => {
      const mode: AppMode =
        level === "wealth" ? "shareholderWealth" : prev.mode === "shareholderWealth" ? "justifiedMultiple" : prev.mode;
      return { ...prev, modelLevel: level, mode };
    });
  }, []);

  const setMode = useCallback((mode: AppMode) => {
    setState((prev) => {
      const modelLevel: ModelLevel =
        mode === "shareholderWealth" ? "wealth" : prev.modelLevel === "wealth" ? "roic" : prev.modelLevel;
      return { ...prev, mode, modelLevel };
    });
  }, []);

  const resetToDefaults = useCallback(() => {
    setState((prev) => ({
      ...prev,
      assumptions: { ...DEFAULT_ASSUMPTIONS, ...(prev.defaults ?? {}) },
    }));
  }, []);

  const saveAsDefaults = useCallback(() => {
    setState((prev) => ({
      ...prev,
      defaults: {
        manualDiscountRate: prev.assumptions.manualDiscountRate,
        equityRiskPremium: prev.assumptions.equityRiskPremium,
        businessLife: prev.assumptions.businessLife,
        matureROIC: prev.assumptions.matureROIC,
        matureReinvestmentRate: prev.assumptions.matureReinvestmentRate,
        externalReinvestmentReturn: prev.assumptions.externalReinvestmentReturn,
      },
    }));
  }, []);

  const api = useMemo(
    () => ({
      assumptions: state.assumptions,
      modelLevel: state.modelLevel,
      mode: state.mode,
      defaults: state.defaults,
      setField,
      setAssumptions,
      setModelLevel,
      setMode,
      resetToDefaults,
      saveAsDefaults,
    }),
    [
      state,
      setField,
      setAssumptions,
      setModelLevel,
      setMode,
      resetToDefaults,
      saveAsDefaults,
    ],
  );

  return api;
}
