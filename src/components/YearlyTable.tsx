import { useState } from "react";
import { fmtPercent } from "../lib/valuation";
import type { YearlyValuationRow } from "../lib/valuation";
import { Section } from "./primitives";

interface Props {
  rows: YearlyValuationRow[];
  isWealth: boolean;
  onExportCSV: () => void;
}

export function YearlyTable({ rows, isWealth, onExportCSV }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <Section
      title="Year-by-Year"
      right={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onExportCSV}
            className="text-xs px-2 py-1 rounded border border-ink-200 text-ink-600 hover:bg-ink-50"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="text-xs px-2 py-1 rounded border border-ink-200 text-ink-600 hover:bg-ink-50"
          >
            {open ? "Hide" : "Show"} ({rows.length} yrs)
          </button>
        </div>
      }
    >
      {open ? (
        <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
          <table className="w-full text-xs tabular-nums">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-ink-100">
                <th className="text-left px-2 py-1">Year</th>
                <th className="text-right px-2 py-1">Earnings</th>
                <th className="text-right px-2 py-1">ROIC</th>
                <th className="text-right px-2 py-1">RR</th>
                <th className="text-right px-2 py-1">Growth</th>
                <th className="text-right px-2 py-1">Reinvested</th>
                <th className="text-right px-2 py-1">Payout</th>
                <th className="text-right px-2 py-1">DF</th>
                <th className="text-right px-2 py-1">PV</th>
                {isWealth ? (
                  <th className="text-right px-2 py-1">FV Payout</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.year} className="border-b border-ink-50">
                  <td className="px-2 py-0.5">{r.year}</td>
                  <td className="text-right px-2 py-0.5">
                    {r.earnings.toFixed(2)}
                  </td>
                  <td className="text-right px-2 py-0.5">
                    {fmtPercent(r.roic, 1)}
                  </td>
                  <td className="text-right px-2 py-0.5">
                    {fmtPercent(r.reinvestmentRate, 1)}
                  </td>
                  <td className="text-right px-2 py-0.5">
                    {fmtPercent(r.earningsGrowth, 2)}
                  </td>
                  <td className="text-right px-2 py-0.5">
                    {r.reinvestedEarnings.toFixed(2)}
                  </td>
                  <td className="text-right px-2 py-0.5">
                    {r.ownerCashFlow.toFixed(2)}
                  </td>
                  <td className="text-right px-2 py-0.5">
                    {r.discountFactor.toFixed(4)}
                  </td>
                  <td className="text-right px-2 py-0.5">
                    {r.presentValue.toFixed(4)}
                  </td>
                  {isWealth ? (
                    <td className="text-right px-2 py-0.5">
                      {r.fvPayout !== undefined ? r.fvPayout.toFixed(2) : "—"}
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-xs text-ink-500">
          {rows.length} projected years. Expand to view detail or export to CSV.
        </p>
      )}
    </Section>
  );
}
