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
              A small valuation tool for thinking about earnings multiples.
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

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8 text-ink-800 leading-relaxed">
        <section className="space-y-3">
          <p>
            The tool that this page introduces does a single job. Given your
            assumptions about a business (how fast its earnings can grow, how
            much capital it has to reinvest to grow at that rate, how long it
            can keep doing so, and what discount rate is appropriate for the
            risk involved), it returns the earnings multiple that those
            assumptions justify. Run in reverse, given today's market
            multiple, it returns the assumptions the market is currently
            pricing in. That is the entirety of what it does. We use it
            ourselves in our research process, and thought it might be
            useful to put a version of it online for a few friends.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Why a multiple alone hides more than it shows
          </h2>
          <p>
            A P/E ratio compresses a great deal of information into a single
            number. That compression is convenient for screening, but it
            tends to hide exactly the things that matter most to a long-term
            investor. Two businesses can both trade at 25x earnings while
            being entirely different propositions underneath. One of them
            may earn 40% on incremental capital and reinvest only a small
            fraction of its earnings to grow, paying the rest out to owners.
            The other may earn 8% on capital and have to reinvest every
            dollar of earnings just to maintain its competitive position.
            Looking only at the multiple, an investor would not be able to
            tell those two businesses apart, even though the first is a
            compounder and the second is a treadmill. The point of this
            tool is to make the assumptions underneath a multiple explicit
            enough that the difference between the two becomes obvious.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight">
            The three modes
          </h2>
          <p>
            There are three modes that you can switch between using the
            toggles at the top of the calculator. Each one is built around
            a different question.
          </p>
          <p>
            The first mode, Justified Multiple, is where most of the work
            gets done. You enter your view of the business (your estimate
            of its incremental return on capital, the fraction of earnings
            it needs to reinvest to sustain that return, how long the
            high-return Stage 1 period continues, and your chosen discount
            rate), and the tool returns the P/E that those inputs justify.
            It also compares that justified multiple against the current
            market multiple and expresses the difference as a discount or a
            premium to intrinsic value. A positive discount indicates that
            the market is offering the business below what your assumptions
            say it is worth, and a negative number means the market is
            asking you to pay more than your view supports.
          </p>
          <p>
            The second mode, Implied Assumptions, runs the same model in
            reverse. You enter today's market multiple, choose a variable
            to solve for (such as ROIC, reinvestment rate, Stage 1
            duration, discount rate, mature ROIC, or mature reinvestment
            rate), and the tool solves for the value of that variable that
            would make the current multiple fair. This is useful for asking
            the question, "What is the market asking me to believe at
            today's price?" Whether that belief is reasonable is, of
            course, a separate question, and one you have to answer
            yourself.
          </p>
          <p>
            The third mode, Shareholder Wealth, takes the perspective of
            an investor buying the company and holding it for some number
            of years. You enter the multiple you would pay today, the
            multiple you would accept on exit, the holding period, and the
            rate at which you would reinvest payouts received along the
            way. The tool returns an investor IRR and breaks that return
            down into its parts, showing how much came from earnings
            growth, how much from the change in multiple, how much from
            the payouts themselves, and how much from your external
            reinvestment of those payouts. We use this mode for dividend
            payers, repurchase-heavy companies, and any situation in which
            we want to keep the company's underlying economics distinct
            from our own portfolio's reinvestment decisions.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight">
            The default model and the simple alternative
          </h2>
          <p>
            Across all three modes, there are also two underlying model
            levels. The default, ROIC / Reinvestment, derives earnings
            growth directly from the underlying economics of the business:
            growth in any given year equals the return on incremental
            capital multiplied by the reinvestment rate, and whatever
            earnings are not reinvested become owner cash flow. We
            strongly prefer this model because it forces you to take a
            position on what is actually generating the growth, rather
            than letting growth float as a free parameter that has no
            connection to the economics of the business. The alternative,
            the Simple Growth model, lets you input a growth rate directly,
            which can be useful for quick back-of-the-envelope work, but it
            cannot tell apart a business that grows because it earns
            extraordinary returns on capital from one that grows by
            consuming all of its earnings to do so.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight">
            How we use it
          </h2>
          <p>
            In practice, here is roughly the order of operations that we
            follow when we are using the tool to test a company against
            our view.
          </p>
          <p>
            We start in ROIC / Reinvestment mode with our honest view of
            the business. The Stage 1 inputs (ROIC, reinvestment rate,
            duration) capture the period during which we expect the
            company to earn returns meaningfully above its cost of
            capital, and the mature inputs capture what the business
            settles into after competition has compressed those returns.
            We set the discount rate based on the risk profile of the
            company and the prevailing rate environment.
          </p>
          <p>
            We then look at two outputs. The first is the justified P/E,
            which is the headline number. The second is the discount-to-
            intrinsic pill next to it, which tells us in one number
            whether the market is offering the business at a discount, at
            roughly fair value, or at a premium, all relative to the
            assumptions we just entered.
          </p>
          <p>
            If the discount or premium looks large, we move down the page
            to the sensitivity table and try to identify which assumption
            our conclusion most depends on. A justified P/E that swings
            substantially with a one-point change in ROIC is a justified
            P/E that we should not place much confidence in. When a small
            change in input produces a large change in output, we have not
            really learned anything new about the company; we have only
            translated one guess into another.
          </p>
          <p>
            When we suspect that the market is pricing in something we
            have not, we move to Implied Assumptions and let the solver
            back into what the market needs to be true. If the answer is
            something the business can plausibly deliver, we take that as
            evidence that the market is being roughly reasonable. If the
            answer is implausible (for instance, the market needing the
            business to earn 60% on incremental capital for fifteen
            consecutive years), then either we have found a meaningfully
            mispriced security or we are missing something material about
            the company that other investors understand and we do not.
          </p>
          <p>
            For dividend payers, share-repurchase-heavy companies, or any
            company where capital returned to shareholders is expected to
            be a material fraction of total return, we switch to
            Shareholder Wealth and look at the IRR breakdown. The
            attribution is the most useful part of that view: if our IRR
            is coming mostly from a multiple expanding rather than from
            the business's own economics, then we are not really
            investing in the company. We are betting on what other
            investors will be willing to pay for it later, which is a
            very different exercise.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight">
            What this tool does not do
          </h2>
          <p>
            There are a number of things that this tool is not intended to
            do, and it is worth being explicit about them. It is not a
            substitute for a three-statement model. It is not a screener,
            and it will not generate investment ideas on its own. It
            cannot evaluate the quality of management, the durability of
            the moat, or the realism of the cash flows that you have
            projected. Those are all far harder questions, and the only
            way we know to answer them is by reading annual reports
            carefully, talking to operators and competitors, building
            relationships with management teams over time, and being
            wrong in expensive ways over many years. What this tool does
            is take the answers you have already worked out about a
            business and show you what those answers add up to in terms
            of the multiple they justify.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight">
            A few practical notes
          </h2>
          <p>
            Every calculation runs locally in your browser, and nothing is
            sent to a server. Your assumptions are saved in your browser's
            local storage, so closing the tab is safe, but using the tool
            on a different device will reset the inputs to defaults. There
            is a collapsible section at the bottom of the calculator
            called "How this is calculated" that shows every underlying
            formula the tool uses, so that nothing about the math is
            hidden. The year-by-year projection can be exported as a CSV,
            and the written summary of the assumptions and results can be
            copied to your clipboard for use in your own notes.
          </p>
        </section>

        <div className="pt-6 border-t border-ink-200 space-y-3">
          <p>
            That covers what the tool does and how we use it. The rest is
            in the calculator itself.
          </p>
          <p className="text-sm text-ink-500">Best, Nithin</p>
          <button
            onClick={onStart}
            className="px-4 py-2 rounded-md bg-ink-800 text-white text-sm font-medium hover:bg-ink-900 transition-colors"
          >
            {alreadySeen ? "Back to calculator" : "Open the calculator"}
          </button>
        </div>
      </main>
    </div>
  );
}
