export function AppHeader({
  onReset,
  onSaveDefaults,
}: {
  onReset: () => void;
  onSaveDefaults: () => void;
}) {
  return (
    <header className="border-b border-ink-200 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Multiple Lab</h1>
          <p className="text-xs text-ink-500 leading-snug">
            Reverse-engineer the assumptions embedded in an earnings multiple.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onSaveDefaults}
            className="text-xs px-2.5 py-1 rounded border border-ink-200 text-ink-600 hover:bg-ink-50"
          >
            Save as defaults
          </button>
          <button
            onClick={onReset}
            className="text-xs px-2.5 py-1 rounded border border-ink-200 text-ink-600 hover:bg-ink-50"
          >
            Reset to defaults
          </button>
        </div>
      </div>
    </header>
  );
}
