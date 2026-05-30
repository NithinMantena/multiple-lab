import { describe, expect, it } from "vitest";
import { DEFAULT_ASSUMPTIONS } from "../defaults";
import { calculateSimpleModel } from "../simpleModel";
import { calculateROICModel } from "../roicModel";
import { calculateWealthModel } from "../wealthModel";
import { solveImpliedAssumption } from "../solvers";

describe("simple model", () => {
  it("matches a hand-calculated finite-life P/E", () => {
    const a = {
      ...DEFAULT_ASSUMPTIONS,
      simpleGrowthRate: 0.0,
      simpleDuration: 0,
      simpleTerminalGrowth: 0.0,
      simplePayoutRatio: 1.0,
      businessLife: 30,
      manualDiscountRate: 0.1,
      perpetualBusiness: false,
    };
    // Sum_{t=1..30} 1 / 1.1^t  ≈ 9.4269
    const r = calculateSimpleModel(a);
    expect(r.justifiedPE).toBeGreaterThan(9.4);
    expect(r.justifiedPE).toBeLessThan(9.5);
  });

  it("perpetual model uses Gordon terminal", () => {
    const a = {
      ...DEFAULT_ASSUMPTIONS,
      simpleGrowthRate: 0.05,
      simpleDuration: 0,
      simpleTerminalGrowth: 0.03,
      simplePayoutRatio: 1.0,
      manualDiscountRate: 0.09,
      perpetualBusiness: true,
    };
    // With no explicit stage: PV ≈ 1*1.03 / (0.09 - 0.03) = 17.17
    const r = calculateSimpleModel(a);
    expect(r.justifiedPE).toBeCloseTo(17.17, 1);
  });
});

describe("roic model", () => {
  it("growth follows ROIC * reinvestment rate", () => {
    const a = DEFAULT_ASSUMPTIONS;
    const r = calculateROICModel(a);
    expect(r.stage1Growth).toBeCloseTo(0.25 * 0.4, 6);
    expect(r.matureGrowth).toBeCloseTo(0.12 * 0.25, 6);
    expect(r.stage1PayoutRatio).toBeCloseTo(0.6, 6);
    expect(r.maturePayoutRatio).toBeCloseTo(0.75, 6);
  });

  it("produces a sensible default P/E in the 20s", () => {
    const r = calculateROICModel(DEFAULT_ASSUMPTIONS);
    expect(r.justifiedPE).toBeGreaterThan(15);
    expect(r.justifiedPE).toBeLessThan(35);
  });
});

describe("wealth model", () => {
  it("zero ROIC + flat exit: IRR equals reinvestment of payouts", () => {
    const a = {
      ...DEFAULT_ASSUMPTIONS,
      stage1ROIC: 0.0,
      stage1ReinvestmentRate: 0.0,
      matureROIC: 0.0,
      matureReinvestmentRate: 0.0,
      purchasePE: 10,
      exitPE: 10,
      holdingPeriod: 10,
      externalReinvestmentReturn: 0.1,
      payoutTreatment: "reinvestExternally" as const,
    };
    const r = calculateWealthModel(a);
    // Each year pay $1 (100% payout, no growth); reinvest at 10%
    // FV of $1 annuity for 10 years at 10% ≈ 15.937, plus stock value 10 → 25.937
    expect(r.fvOfPayouts).toBeCloseTo(15.937, 2);
    expect(r.endingStockValue).toBeCloseTo(10, 6);
    expect(r.endingWealth).toBeCloseTo(25.937, 2);
  });
});

describe("solver", () => {
  it("solves for stage1 ROIC that produces current P/E", () => {
    const a = { ...DEFAULT_ASSUMPTIONS, currentPE: 30 };
    const baseline = calculateROICModel(a).justifiedPE;
    const result = solveImpliedAssumption(a, {
      target: "stage1ROIC",
      desiredValue: 30,
      level: "roic",
    });
    expect(result.ok).toBe(true);
    // Solved ROIC should be different from baseline (30x > default ~24x)
    expect(result.value).toBeGreaterThan(a.stage1ROIC);
    // And applying it should give a P/E near 30
    const verify = calculateROICModel({ ...a, stage1ROIC: result.value });
    expect(verify.justifiedPE).toBeCloseTo(30, 1);
    expect(baseline).toBeGreaterThan(0);
  });
});
