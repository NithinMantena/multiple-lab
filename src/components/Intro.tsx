interface Props {
  onStart: () => void;
  alreadySeen: boolean;
}

export function Intro({ onStart, alreadySeen }: Props) {
  return (
    <div className="min-h-screen bg-ink-50/30">
      <header className="border-b border-ink-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-baseline justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Multiple Lab</h1>
            <p className="text-xs text-ink-500 leading-snug">
              Reverse-engineer the assumptions embedded in an earnings multiple.
            </p>
          </div>
          {alreadySeen ? (
            <button
              onClick={onStart}
              className="text-xs px-2.5 py-1 rounded border border-ink-200 text-ink-600 hover:bg-ink-50"
            >
              Back to calculator
            </button>
          ) : null}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8 text-ink-800">
        <section className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight">
            What this is
          </h2>
          <p className="leading-relaxed">
            Multiple Lab is a thinking tool for long-term investors. It answers
            two related questions:
          </p>
          <ol className="list-decimal pl-5 space-y-1 leading-relaxed marker:text-ink-400">
            <li>
              Given my assumptions about a business, <em>what earnings multiple is justified?</em>
            </li>
            <li>
              Given the current market multiple, <em>what assumptions must be true for that multiple to be fair?</em>
            </li>
          </ol>
          <p className="leading-relaxed">
            It is not a three-statement model, a stock screener, or a Bloomberg
            replacement. It is a fast, transparent assumption-tester.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight">The core idea</h2>
          <blockquote className="border-l-2 border-ink-300 pl-4 italic text-ink-700 leading-relaxed">
            A company does not deserve a high multiple merely because it grows.
            It deserves a high multiple when it can grow while producing
            distributable cash at attractive returns on capital.
          </blockquote>
          <p className="leading-relaxed">
            Two companies can both grow earnings at 10%. One earns 50% on
            invested capital and reinvests just 20% of earnings — paying out the
            rest. The other earns 10% and must reinvest everything to grow at
            all. They look identical on a P/E screen. They are not the same
            business.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight">
            How it works — three models
          </h2>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium">
                Simple growth
              </p>
              <p className="text-ink-600 leading-relaxed">
                Pick an earnings growth rate and a duration. Quick back-of-the-envelope.
              </p>
            </div>
            <div>
              <p className="font-medium">
                ROIC / Reinvestment <span className="text-ink-400 text-xs ml-1">(default)</span>
              </p>
              <p className="text-ink-600 leading-relaxed">
                Growth is derived from the economics of the business:{" "}
                <code className="bg-ink-100 px-1 rounded text-[12px]">growth = ROIC × reinvestment rate</code>.
                Whatever isn't reinvested is paid out as owner cash flow. This
                is the most honest way to distinguish a great business from a
                mediocre one.
              </p>
            </div>
            <div>
              <p className="font-medium">Shareholder Wealth</p>
              <p className="text-ink-600 leading-relaxed">
                Compute your <em>total return</em> if you buy at one multiple,
                exit at another after some years, and reinvest the dividends or
                buybacks you receive at some external rate. Useful for
                comparing dividend-payers against compounders.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Three modes you can switch between
          </h2>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>
              <span className="font-medium">Justified Multiple.</span> Enter
              assumptions, see the P/E they justify. Compare against the
              current market multiple.
            </li>
            <li>
              <span className="font-medium">Implied Assumptions.</span> Enter a
              current market multiple, pick a variable (ROIC, reinvestment,
              duration, discount rate…), and the app solves for the value of
              that variable that makes the multiple fair.
            </li>
            <li>
              <span className="font-medium">Shareholder Wealth.</span> Enter a
              purchase price, exit multiple, holding period, and external
              reinvestment rate — get an investor IRR plus a breakdown of
              where the return came from.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Key concept: company value vs shareholder wealth
          </h2>
          <p className="leading-relaxed">
            If Coca-Cola pays you $1 in dividends and you reinvest that dollar
            into Progressive at 10%, the 10% return belongs to <em>your portfolio</em>,
            not Coke's business economics. So the app keeps them separate:
          </p>
          <ul className="text-sm space-y-1 leading-relaxed">
            <li>
              <span className="font-medium">Company intrinsic value</span> (Justified
              Multiple mode) — excludes external reinvestment of payouts.
            </li>
            <li>
              <span className="font-medium">Shareholder wealth</span> (Wealth
              mode) — includes external reinvestment of payouts.
            </li>
          </ul>
          <p className="text-ink-500 text-sm leading-relaxed">
            On the Shareholder Wealth tab you'll also see a{" "}
            <em>discount or premium to intrinsic value</em> — i.e. whether
            your purchase P/E is above or below the P/E the business actually
            deserves, given your assumptions.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight">How to use it</h2>
          <ol className="list-decimal pl-5 space-y-2 leading-relaxed marker:text-ink-400 text-sm">
            <li>
              Start in <span className="font-medium">ROIC / Reinvestment</span>.
              Enter your view of the company's incremental ROIC, what share of
              earnings it must reinvest to maintain growth, and how long that
              economic moat lasts (Stage 1 duration). Add a discount rate.
            </li>
            <li>
              Look at the <span className="font-medium">justified P/E</span>{" "}
              and how it compares to the current multiple. The pill labelled{" "}
              <em>"discount to intrinsic"</em> tells you the gap.
            </li>
            <li>
              Use the <span className="font-medium">sensitivity table</span>{" "}
              to see how the multiple changes with ROIC, reinvestment, or
              duration. Swap row/column variables to test the levers that
              matter most.
            </li>
            <li>
              Flip to <span className="font-medium">Implied Assumptions</span>{" "}
              and let the solver tell you what the market is asking you to
              believe at today's price.
            </li>
            <li>
              For dividend / buyback names, switch to{" "}
              <span className="font-medium">Shareholder Wealth</span> to
              project your total return.
            </li>
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight">Notes</h2>
          <ul className="text-sm text-ink-600 space-y-1 leading-relaxed">
            <li>All calculations run in your browser. Nothing is sent anywhere.</li>
            <li>Your inputs are saved in this browser's local storage.</li>
            <li>You can export the year-by-year model as CSV, or copy a written summary.</li>
            <li>Open the "How this is calculated" panel any time to see the underlying formulas.</li>
          </ul>
        </section>

        <div className="pt-4 border-t border-ink-200">
          <button
            onClick={onStart}
            className="px-4 py-2 rounded-md bg-ink-800 text-white text-sm font-medium hover:bg-ink-900 transition-colors"
          >
            {alreadySeen ? "Back to calculator" : "Start using Multiple Lab →"}
          </button>
        </div>
      </main>
    </div>
  );
}
