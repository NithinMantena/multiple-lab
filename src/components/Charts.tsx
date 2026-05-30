import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ValuationBundle } from "../hooks/useValuation";
import type { ValuationAssumptions } from "../lib/valuation";
import { Section } from "./primitives";

export function ValueByPeriodChart({
  bundle,
  perpetual,
}: {
  bundle: ValuationBundle;
  perpetual: boolean;
}) {
  const v = bundle.valuation.valueByPeriod;
  const data = [
    { name: "1–5", value: v.years1To5 },
    { name: "6–10", value: v.years6To10 },
    { name: "11–20", value: v.years11To20 },
    { name: "21–40", value: v.years21To40 },
    { name: "41+", value: v.years41Plus },
  ];
  if (perpetual) data.push({ name: "Terminal", value: v.terminalValue });

  return (
    <Section title="Value by Time Period">
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#888" />
            <YAxis tick={{ fontSize: 11 }} stroke="#888" />
            <Tooltip
              formatter={(value: number) => `$${value.toFixed(2)}`}
              labelStyle={{ fontSize: 12 }}
              contentStyle={{ fontSize: 12 }}
            />
            <Bar dataKey="value" fill="#262626" radius={[3, 3, 0, 0]}>
              {data.map((d, i) => (
                <Cell
                  key={i}
                  fill={d.name === "Terminal" ? "#8c8c8c" : "#262626"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Section>
  );
}

export function EarningsAndCashflowChart({
  bundle,
}: {
  bundle: ValuationBundle;
}) {
  const data = bundle.valuation.yearlyRows.slice(0, 40).map((r) => ({
    year: r.year,
    Earnings: r.earnings,
    "Owner Cash Flow": r.ownerCashFlow,
    "Reinvested Earnings": r.reinvestedEarnings,
  }));
  return (
    <Section title="Earnings & Owner Cash Flow">
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} stroke="#888" />
            <YAxis tick={{ fontSize: 11 }} stroke="#888" />
            <Tooltip
              formatter={(value: number) => value.toFixed(2)}
              labelFormatter={(l) => `Year ${l}`}
              labelStyle={{ fontSize: 12 }}
              contentStyle={{ fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line
              type="monotone"
              dataKey="Earnings"
              stroke="#0a0a0a"
              dot={false}
              strokeWidth={1.5}
            />
            <Line
              type="monotone"
              dataKey="Owner Cash Flow"
              stroke="#10b981"
              dot={false}
              strokeWidth={1.5}
            />
            <Line
              type="monotone"
              dataKey="Reinvested Earnings"
              stroke="#9ca3af"
              dot={false}
              strokeWidth={1.5}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Section>
  );
}

export function WealthAttributionChart({
  bundle,
  assumptions,
}: {
  bundle: ValuationBundle;
  assumptions: ValuationAssumptions;
}) {
  const w = bundle.wealth;
  const data = [
    { name: "Purchase price", value: w.purchasePrice },
    { name: "Earnings growth", value: w.earningsGrowthValue },
    { name: "Multiple change", value: w.multipleChangeValue },
    { name: "Raw payouts", value: w.rawPayouts },
    { name: "Reinvestment gain", value: w.externalReinvestmentGain },
  ];
  return (
    <Section title="Shareholder Wealth Attribution">
      <p className="text-xs text-ink-500 mb-2">
        Per ${assumptions.currentEarnings.toFixed(2)} of starting earnings over{" "}
        {assumptions.holdingPeriod} years.
      </p>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#888" interval={0} />
            <YAxis tick={{ fontSize: 11 }} stroke="#888" />
            <Tooltip
              formatter={(value: number) => `$${value.toFixed(2)}`}
              labelStyle={{ fontSize: 12 }}
              contentStyle={{ fontSize: 12 }}
            />
            <Bar dataKey="value" radius={[3, 3, 0, 0]}>
              {data.map((d, i) => (
                <Cell
                  key={i}
                  fill={
                    d.name === "Purchase price"
                      ? "#9ca3af"
                      : d.value < 0
                      ? "#ef4444"
                      : "#262626"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Section>
  );
}
