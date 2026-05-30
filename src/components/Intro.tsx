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

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-9 text-ink-800 leading-relaxed">
        <section className="space-y-3">
          <p className="text-ink-600 italic">
            A short note before you start.
          </p>
          <p>
            When you buy a share of a publicly traded company, you are not
            buying a piece of paper. You are buying a legally binding claim
            on the cash that business can hand back to its owners over time.
            The value of that share, regardless of what anyone tells you, is
            the present value of those future cash flows, adjusted for risk.
            Everything else — multiples, growth narratives, EBITDA arithmetic,
            the talking head on TV with a price target — is shorthand.
          </p>
          <p>
            A P/E ratio is one of those shorthands. It compresses dozens of
            assumptions into a single number: how fast the business can grow,
            how much capital it has to consume to do it, how long the moat
            lasts, what discount rate is fair. Useful for screening. Dangerous
            to lean on. A 35x multiple is not "expensive" and a 10x multiple
            is not "cheap." Whether they are expensive or cheap depends on
            what the multiple is asking you to believe.
          </p>
          <p>
            This tool exists to make those assumptions explicit.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight">
            On intrinsic value
          </h2>
          <p>
            Charlie Munger put it best: <em>all intelligent investing is value
            investing</em>. The dichotomy financial media draws between
            "value" and "growth" is contrived. Growth is one input to value.
            A high-growth company with no moat and a 5% return on capital is
            a poor business. A no-growth company that produces an enormous
            stream of cash for two more decades may be a great one.
          </p>
          <p>
            To estimate intrinsic value you only need three things:
          </p>
          <ul className="list-disc pl-5 space-y-1 marker:text-ink-400">
            <li>the current cash flows of the business,</li>
            <li>how those cash flows will grow, and</li>
            <li>the risk of those cash flows.</li>
          </ul>
          <p>
            Everything in this app — the three model levels, the sensitivity
            tables, the solver — is a way of pressing on those three numbers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight">
            On margin of safety
          </h2>
          <p>
            Once you have an intrinsic value, the next question is how big a
            discount to it you need before you'll act. Seth Klarman calls
            this the margin of safety: buying a dollar for fifty cents. You
            need that gap because your assumptions will be wrong in places
            you can't yet see. The larger the gap, the more room you have to
            be wrong and still come out fine.
          </p>
          <p>
            That is why every screen in this app shows a{" "}
            <span className="font-medium">discount or premium to intrinsic</span>{" "}
            — the gap between what the market is asking and what your
            assumptions justify. On the Shareholder Wealth tab it compares
            the price you'd actually pay against the intrinsic P/E your
            assumptions imply. Positive means a discount. Negative means
            you're paying up.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Why ROIC matters more than growth
          </h2>
          <p>
            Two businesses can both grow earnings at 10% a year. One earns
            50% on incremental capital and reinvests just 20% of its
            earnings — handing the other 80% to owners. The other earns 10%
            on capital and must reinvest every dollar of earnings just to
            grow at all. They look identical on a screener. They are not the
            same business.
          </p>
          <p>
            The first is a compounder. The second is a treadmill. The default
            model in this app derives growth honestly from the underlying
            economics —{" "}
            <code className="bg-ink-100 px-1 rounded text-[12px]">
              growth = ROIC × reinvestment rate
            </code>{" "}
            — and whatever the business does not reinvest becomes owner cash
            flow. This is the most honest way to tell those two businesses
            apart.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Where will the cash go on the way to me?
          </h2>
          <p>
            There is a quieter question that I have learned, painfully,
            matters as much as <em>will this business produce cash</em>: where
            does that cash go on the way to me? A great business with
            mediocre capital allocation can quietly destroy your return.
            Shareholders' capital is a more elastic concept in practice than
            it looks on paper.
          </p>
          <p>
            This app cannot evaluate management for you. But by keeping{" "}
            <span className="font-medium">company intrinsic value</span> (what
            the business can pay out) separate from{" "}
            <span className="font-medium">shareholder wealth</span> (what you
            actually end up with after the dividends are reinvested somewhere
            else), it forces you to take a real position on what management
            will do with the money. If Coca-Cola hands you a dollar and you
            put that dollar into Progressive at 10%, the 10% belongs to{" "}
            <em>your portfolio</em>, not Coke's economics. The two should
            never be muddled.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight">
            The three modes
          </h2>
          <p>Pick the mode that matches the question you're asking.</p>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium text-base">Justified Multiple</p>
              <p className="text-ink-700">
                You hold a view of the business. What multiple does it
                deserve? Set ROIC, reinvestment, duration, discount rate; the
                app returns the P/E those assumptions justify and tells you
                whether the market is offering a discount or a premium.
              </p>
            </div>
            <div>
              <p className="font-medium text-base">Implied Assumptions</p>
              <p className="text-ink-700">
                You see today's multiple. What is the market asking you to
                believe? Pick a variable — ROIC, reinvestment rate, duration,
                discount rate — and the tool solves for the value that makes
                the current multiple fair. Then the only question left is:{" "}
                <em>do you believe that?</em>
              </p>
            </div>
            <div>
              <p className="font-medium text-base">Shareholder Wealth</p>
              <p className="text-ink-700">
                You're thinking about total return. Buy at this multiple,
                exit at that one in N years, reinvest payouts at some rate,
                see your IRR. The return is then attributed: how much came
                from earnings growth, how much from the multiple changing,
                how much from cash you received and put to work elsewhere.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight">
            How I use it
          </h2>
          <ol className="list-decimal pl-5 space-y-2 marker:text-ink-400">
            <li>
              Start in <span className="font-medium">ROIC / Reinvestment</span>.
              Put in your honest view of the company — incremental ROIC, what
              fraction of earnings the business must reinvest to maintain
              that ROIC, and how long you think the moat lets it last.
              Stage 1 duration is your view of how long the business can
              clear its 7-foot hurdles before competition catches up.
            </li>
            <li>
              Look at the justified P/E and the discount-to-intrinsic pill.
              That's the picture in one glance. If the discount is small or
              negative, the market is already paying for your view; you need
              either a better view or a better price.
            </li>
            <li>
              Flip to <span className="font-medium">Implied Assumptions</span>{" "}
              and let the solver tell you what assumption the market is
              asking you to underwrite. If the market needs the business to
              earn 60% on capital for fifteen years — and your honest answer
              is "probably not" — you have your answer.
            </li>
            <li>
              Use the <span className="font-medium">sensitivity table</span>{" "}
              to find the variable your conclusion actually rests on. If
              moving ROIC by one point swings the multiple by 8x, that
              assumption is doing too much work and deserves more scrutiny
              than you've given it.
            </li>
            <li>
              For dividend payers, buybacks, or anything you'd hold through a
              cycle, switch to <span className="font-medium">Shareholder
              Wealth</span> to project the total return. Watch the attribution:
              if most of your IRR is coming from multiple expansion rather
              than business economics, you are not really investing in the
              company — you are betting on the mood of other investors.
            </li>
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight">
            What this tool isn't
          </h2>
          <p>
            It is not a three-statement model. It is not a screener. It is
            not a stock-picking oracle. It will not tell you which businesses
            are durable, who is competent to run them, or whether the cash
            flows you've projected are remotely realistic. Those are the
            hard questions and they take years of reading, modeling, talking
            to operators, and being wrong in expensive ways. This tool just
            tells you what your answers add up to.
          </p>
          <p>
            Peter Lynch once asked a professional money manager what their
            80th-largest position did. The manager couldn't say. The lesson
            wasn't really about position counts — it was that a number on a
            screen tells you nothing about the business behind it. This app
            is on the same side of that fence: useful only after the work
            of understanding the business is already done.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight">A few notes</h2>
          <ul className="space-y-1 text-sm text-ink-700">
            <li>Every calculation runs in your browser. Nothing is sent anywhere.</li>
            <li>Your assumptions are saved in this browser. Switch machines and they reset.</li>
            <li>The year-by-year projection exports to CSV; the written summary copies to clipboard.</li>
            <li>The "How this is calculated" panel at the bottom of the calculator shows every formula.</li>
          </ul>
        </section>

        <div className="pt-6 border-t border-ink-200 space-y-4">
          <p className="text-ink-700">
            That's most of it. The rest is in the calculator.
          </p>
          <p className="text-sm text-ink-500">— Nithin</p>
          <button
            onClick={onStart}
            className="px-4 py-2 rounded-md bg-ink-800 text-white text-sm font-medium hover:bg-ink-900 transition-colors"
          >
            {alreadySeen ? "Back to calculator" : "Open the calculator →"}
          </button>
        </div>
      </main>
    </div>
  );
}
