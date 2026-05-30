import { useEffect, useRef, useState } from "react";

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  multiplier?: number; // e.g. 100 for percent
  digits?: number;
  hint?: string;
  className?: string;
  withSlider?: boolean;
}

export function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 0.1,
  suffix,
  multiplier = 1,
  digits = 1,
  hint,
  withSlider = true,
}: NumberFieldProps) {
  const displayValue = value * multiplier;
  const [text, setText] = useState<string>(displayValue.toFixed(digits));
  const lastExternal = useRef(displayValue);

  useEffect(() => {
    if (Math.abs(displayValue - lastExternal.current) > 1e-9) {
      setText(displayValue.toFixed(digits));
      lastExternal.current = displayValue;
    }
  }, [displayValue, digits]);

  const commit = (raw: string) => {
    const parsed = parseFloat(raw);
    if (!isFinite(parsed)) {
      setText(displayValue.toFixed(digits));
      return;
    }
    const newVal = parsed / multiplier;
    onChange(newVal);
    lastExternal.current = parsed;
  };

  return (
    <label className="block group">
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-ink-500">
          {label}
        </span>
        <div className="flex items-baseline gap-1">
          <input
            type="number"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              const parsed = parseFloat(e.target.value);
              if (isFinite(parsed)) {
                onChange(parsed / multiplier);
                lastExternal.current = parsed;
              }
            }}
            onBlur={(e) => commit(e.target.value)}
            step={step}
            min={min !== undefined ? min * multiplier : undefined}
            max={max !== undefined ? max * multiplier : undefined}
            className="w-20 text-right tabular-nums bg-transparent text-sm font-medium border-b border-ink-200 focus:border-ink-700 focus:outline-none py-0.5"
          />
          {suffix ? (
            <span className="text-sm text-ink-500">{suffix}</span>
          ) : null}
        </div>
      </div>
      {withSlider && min !== undefined && max !== undefined ? (
        <input
          type="range"
          value={displayValue}
          min={min * multiplier}
          max={max * multiplier}
          step={step}
          onChange={(e) => {
            const parsed = parseFloat(e.target.value);
            setText(parsed.toFixed(digits));
            onChange(parsed / multiplier);
            lastExternal.current = parsed;
          }}
          className="w-full mt-1.5 h-1 cursor-pointer"
        />
      ) : null}
      {hint ? (
        <p className="text-xs text-ink-400 mt-1 leading-snug">{hint}</p>
      ) : null}
    </label>
  );
}

interface ToggleProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  size?: "sm" | "md";
}

export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  size = "md",
}: ToggleProps<T>) {
  const padX = size === "sm" ? "px-2.5 py-1" : "px-3.5 py-1.5";
  const text = size === "sm" ? "text-xs" : "text-sm";
  return (
    <div className="inline-flex rounded-md border border-ink-200 bg-ink-50/40 p-0.5">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`${padX} ${text} rounded-[5px] transition-colors ${
              active
                ? "bg-white text-ink-800 shadow-sm border border-ink-200"
                : "text-ink-500 hover:text-ink-700"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function Section({
  title,
  children,
  right,
  className = "",
}: {
  title?: string;
  children: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-md border border-ink-200 bg-white ${className}`}
    >
      {title || right ? (
        <header className="flex items-center justify-between px-4 py-2.5 border-b border-ink-100">
          {title ? (
            <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-500">
              {title}
            </h2>
          ) : (
            <span />
          )}
          {right}
        </header>
      ) : null}
      <div className="p-4">{children}</div>
    </section>
  );
}

export function DerivedRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-xs py-0.5">
      <span className="text-ink-500">{label}</span>
      <span className="tabular-nums font-medium text-ink-700">{value}</span>
    </div>
  );
}

export function Pill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "warn" | "error" | "good";
}) {
  const toneClass =
    tone === "warn"
      ? "bg-amber-50 text-amber-800 border-amber-200"
      : tone === "error"
      ? "bg-red-50 text-red-800 border-red-200"
      : tone === "good"
      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
      : "bg-ink-50 text-ink-700 border-ink-200";
  return (
    <span
      className={`inline-flex items-center text-xs px-2 py-0.5 rounded border ${toneClass}`}
    >
      {children}
    </span>
  );
}
