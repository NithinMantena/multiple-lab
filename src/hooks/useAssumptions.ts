import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_ASSUMPTIONS,
  type ValuationAssumptions,
  type ModelLevel,
  type AppMode,
} from "../lib/valuation";

const STORAGE_KEY = "multiple-lab:state:v1";

export type AppView = "intro" | "calculator";

interface PersistedState {
  assumptions: ValuationAssumptions;
  modelLevel: ModelLevel;
  mode: AppMode;
  defaults?: Partial<ValuationAssumptions>;
  view: AppView;
  hasSeenIntro: boolean;
}

function loadInitial(): PersistedState {
  const base: PersistedState = {
    assumptions: DEFAULT_ASSUMPTIONS,
    modelLevel: "roic",
    mode: "justifiedMultiple",
    view: "intro",
    hasSeenIntro: false,
  };
  if (typeof window === "undefined") return base;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    const hasSeenIntro = parsed.hasSeenIntro ?? false;
    return {
      assumptions: { ...DEFAULT_ASSUMPTIONS, ...(parsed.assumptions ?? {}) },
      modelLevel: parsed.modelLevel ?? "roic",
      mode: parsed.mode ?? "justifiedMultiple",
      defaults: parsed.defaults,
      hasSeenIntro,
      view: hasSeenIntro ? "calculator" : "intro",
    };
  } catch {
    return base;
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

  const setView = useCallback((view: AppView) => {
    setState((prev) => ({
      ...prev,
      view,
      hasSeenIntro: view === "calculator" ? true : prev.hasSeenIntro,
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
      view: state.view,
      hasSeenIntro: state.hasSeenIntro,
      setField,
      setAssumptions,
      setModelLevel,
      setMode,
      setView,
      resetToDefaults,
      saveAsDefaults,
    }),
    [
      state,
      setField,
      setAssumptions,
      setModelLevel,
      setMode,
      setView,
      resetToDefaults,
      saveAsDefaults,
    ],
  );

  return api;
}
