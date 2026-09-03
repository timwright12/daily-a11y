// src/components/CriterionApp.jsx
import { useState, useMemo, useEffect } from "react";
import Hero from "./Hero.jsx";
import CodeSpread from "./CodeSpread.jsx";
import ComprehensionCheck from "./ComprehensionCheck.jsx";
import ShareBar from "./ShareBar.jsx";
import RerollLink from "./RerollLink.jsx";
import BrowseList from "./BrowseList.jsx";
import { daysSinceEpoch, getTodayIndex, randomIndex } from "../rotation.js";
import { readState, writeState, defaultState } from "../storage.js";
import { recordAnswer, currentStreak } from "../gamification/streak.js";
import { markSeen, coverageSummary } from "../gamification/coverage.js";
import { buildShareText } from "../gamification/shareCard.js";

function RelatedCriteria({ criterion, criteria, sectionClass, headingClass }) {
  if (criterion.relatedCriteria.length === 0) return null;

  const related = criterion.relatedCriteria
    .map((id) => criteria.find((candidate) => candidate.id === id))
    .filter(Boolean);

  return (
    <section aria-labelledby="related-heading" className={sectionClass}>
      <h2 id="related-heading" className={headingClass}>
        Related criteria
      </h2>
      <ul className="list-none m-0 p-0 flex flex-col gap-2">
        {related.map((relatedCriterion) => (
          <li key={relatedCriterion.id}>
            <a
              href={`${import.meta.env.BASE_URL}browse/#${relatedCriterion.id}`}
              className="text-[1.0625rem] text-ink"
            >
              {relatedCriterion.id} {relatedCriterion.name}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CriterionContent({ criterion, criteria, initialAnswer, onAnswered }) {
  // Every section shares a top border/padding; a section-after-a-section
  // additionally gets margin-top for extra breathing room (matching the old
  // CSS's `section + section { margin-top }`). The first section here is
  // preceded by Hero, not another section, so it skips that extra margin —
  // Tailwind's `first:` variant can't express this because it targets "first
  // child of the parent <main>" (which is Hero's own div, not this section),
  // not "first section," so the no-margin variant is spelled out explicitly.
  const firstSectionClass = "pt-10 border-t border-rule";
  const sectionClass = `${firstSectionClass} mt-10`;
  const headingClass =
    "font-mono text-[0.8rem] font-semibold tracking-[0.08em] uppercase text-ink-quiet mb-5";
  const bodyClass = "m-0 text-[1.0625rem] max-w-[38rem]";

  return (
    <>
      <Hero criterion={criterion} />
      <section
        aria-labelledby="explanation-heading"
        className={firstSectionClass}
      >
        <h2 id="explanation-heading" className={headingClass}>
          What this means
        </h2>
        <p className={bodyClass}>{criterion.explanation}</p>
      </section>
      <section aria-labelledby="who-heading" className={sectionClass}>
        <h2 id="who-heading" className={headingClass}>
          Who it affects
        </h2>
        <p className={bodyClass}>{criterion.whoItAffects}</p>
      </section>
      <section aria-labelledby="code-heading" className={sectionClass}>
        <h2 id="code-heading" className={headingClass}>
          Code example
        </h2>
        <CodeSpread codeExample={criterion.codeExample} />
      </section>
      <section aria-labelledby="test-heading" className={sectionClass}>
        <h2 id="test-heading" className={headingClass}>
          How to test it
        </h2>
        <p className={bodyClass}>{criterion.howToTest}</p>
      </section>
      <RelatedCriteria
        criterion={criterion}
        criteria={criteria}
        sectionClass={sectionClass}
        headingClass={headingClass}
      />
      <ComprehensionCheck
        criterion={criterion}
        initialAnswer={initialAnswer}
        onAnswered={onAnswered}
      />
    </>
  );
}

function TodayApp({ criteria }) {
  const today = useMemo(() => new Date(), []);
  const todayDayNumber = useMemo(() => daysSinceEpoch(today), [today]);
  const todayIndex = useMemo(
    () => getTodayIndex(today, criteria.length),
    [today, criteria.length],
  );
  const criterion = criteria[todayIndex];

  // Astro prerenders this island on the server (no localStorage there), then
  // hydrates the same markup in the browser. Starting from defaultState()
  // here — the same value readState() falls back to on the server — keeps
  // the client's first render identical to the server-rendered HTML it's
  // hydrating onto; the real, possibly-answered state is then loaded in the
  // effect below, which only runs after that first render is reconciled.
  const [state, setState] = useState(defaultState);

  // react-hooks/set-state-in-effect generally warns against syncing state via
  // an effect in favor of computing it during render, but there's no
  // render-time alternative for a genuinely external, browser-only source
  // like localStorage that must stay unread until after the SSR-matching
  // first render — this is the same mount-effect shape React's own
  // hydration-mismatch guidance recommends (see readState()'s doc comment in
  // storage.js), applied through regular state instead of
  // useSyncExternalStore, which doesn't fit here since this state isn't only
  // a localStorage mirror — handleAnswered also owns and updates it.

  // Whether today's criterion was already answered as of page load — captured
  // once, inside the mount effect below, from the freshly-loaded localStorage
  // state rather than derived live from `state` on every render. This is what
  // gates the "already answered" banner: deriving it live from `state` would
  // flip it from false to true the instant handleAnswered updates state after
  // a fresh submit in this same session, showing the "already answered"
  // banner one frame after the user just answered. The result text itself
  // (correct/incorrect) is unaffected — that's still derived from `state` on
  // every render via lastCheckResult below.
  const [wasAlreadyAnsweredOnLoad, setWasAlreadyAnsweredOnLoad] =
    useState(false);

  useEffect(() => {
    const initial = readState();
    const withCurrentStreak = {
      ...initial,
      streak: currentStreak(initial.streak, todayDayNumber),
    };
    writeState(withCurrentStreak);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(withCurrentStreak);
    setWasAlreadyAnsweredOnLoad(
      withCurrentStreak.lastAnswer !== null &&
        withCurrentStreak.lastAnswer.day === todayDayNumber &&
        withCurrentStreak.lastAnswer.criterionId === criterion.id,
    );
    // criterion.id is stable for the component's lifetime (today's rotation
    // doesn't change without a reload), so this effect is intentionally
    // mount-only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const alreadyAnsweredToday =
    state.lastAnswer !== null &&
    state.lastAnswer.day === todayDayNumber &&
    state.lastAnswer.criterionId === criterion.id;

  // Derived from state rather than its own useState: state.lastAnswer
  // already carries the outcome of the most recent submit (handleAnswered
  // writes it in the same update that makes alreadyAnsweredToday true), so a
  // second piece of state kept in sync via an effect would be redundant.
  const lastCheckResult = alreadyAnsweredToday
    ? state.lastAnswer.correct
    : null;

  function handleAnswered(isCorrect, choice) {
    const nextState = {
      ...state,
      streak: recordAnswer(state.streak, todayDayNumber),
      coverage: markSeen(state.coverage, criterion.id),
      lastAnswer: {
        day: todayDayNumber,
        criterionId: criterion.id,
        choice,
        correct: isCorrect,
      },
    };
    writeState(nextState);
    setState(nextState);
  }

  const { seen, total } = coverageSummary(state.coverage, criteria.length);
  const statusText = `Streak: ${state.streak.count} day${state.streak.count === 1 ? "" : "s"} — ${seen} of ${total} criteria seen`;
  const shareText = buildShareText(
    criterion,
    state.streak.count,
    lastCheckResult,
  );

  return (
    <>
      <header className="border-b border-rule">
        <div className="masthead max-w-[42rem] mx-auto px-5 py-[1.25rem] flex items-baseline justify-between gap-4 flex-wrap">
          <a
            href={import.meta.env.BASE_URL}
            className="font-mono font-semibold text-[0.9rem] tracking-[0.02em] text-ink no-underline"
          >
            Daily Accessibility
          </a>
          <p className="m-0 font-mono text-[0.8rem] text-ink-quiet tracking-[0.01em]">
            {statusText}
          </p>
        </div>
      </header>
      <main className="max-w-[42rem] mx-auto pt-10 px-5 pb-20">
        <CriterionContent
          criterion={criterion}
          criteria={criteria}
          initialAnswer={
            wasAlreadyAnsweredOnLoad && alreadyAnsweredToday
              ? {
                  choice: state.lastAnswer.choice,
                  correct: state.lastAnswer.correct,
                }
              : null
          }
          onAnswered={handleAnswered}
        />
        <ShareBar shareText={shareText} />
      </main>
    </>
  );
}

function RandomApp({ criteria }) {
  // Math.random() can't agree between the server's prerender and the
  // client's first hydration render, so a random pick made directly in a
  // useState initializer is a hydration mismatch (React error #418) whenever
  // the two picks differ. Both start from the same index (0) instead — the
  // criterion the server actually rendered — then re-roll to a genuinely
  // random pick after mount, once hydration is safely past the point where
  // mismatches matter. Reroll (the "Show me another" link) already reloads
  // this page and re-triggers this same mount effect, so the end result —
  // a random criterion once JS has run — is unchanged.
  const [criterion, setCriterion] = useState(() => criteria[0]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCriterion(criteria[randomIndex(criteria.length)]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="max-w-[42rem] mx-auto pt-10 px-5 pb-20">
      <CriterionContent
        criterion={criterion}
        criteria={criteria}
        initialAnswer={null}
      />
      <RerollLink />
    </main>
  );
}

function BrowseApp({ criteria }) {
  const [selected, setSelected] = useState(null);

  // location.hash lets a related-criteria link (/browse/#<id>) deep-link
  // into a specific criterion. This is unavailable during Astro's server
  // prerender, so the initial value is read in a mount effect rather than
  // the useState initializer above (see TodayApp's mount effect for why: SSR
  // has no window to read from). A related-criteria link's target is this
  // same /browse/ page, so clicking one only changes the URL fragment
  // in-place rather than remounting BrowseApp — a "hashchange" listener is
  // needed to react to that, not just a one-time mount read.
  useEffect(() => {
    function selectFromHash() {
      const hashId = window.location.hash.slice(1);
      if (!hashId) return;
      const match = criteria.find((criterion) => criterion.id === hashId);
      if (match) {
        setSelected(match);
      }
    }

    selectFromHash();
    window.addEventListener("hashchange", selectFromHash);
    return () => window.removeEventListener("hashchange", selectFromHash);
    // criteria is stable for this component's lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid grid-cols-[18rem_1fr] items-start max-[720px]:grid-cols-1">
      <BrowseList
        criteria={criteria}
        activeCriterionId={selected ? selected.id : null}
        onSelect={setSelected}
      />
      <main className="max-w-[42rem] m-0 pt-10 px-8 pb-20">
        {selected ? (
          <CriterionContent
            criterion={selected}
            criteria={criteria}
            initialAnswer={null}
          />
        ) : (
          <>
            <h1 className="font-display font-medium text-[1.75rem] leading-[1.2] mb-3">
              Browse WCAG success criteria
            </h1>
            <p className="text-ink-quiet text-[1.0625rem] m-0">
              Select a criterion from the list to preview it.
            </p>
          </>
        )}
      </main>
    </div>
  );
}

export default function CriterionApp({ mode, criteria }) {
  if (mode === "today") return <TodayApp criteria={criteria} />;
  if (mode === "random") return <RandomApp criteria={criteria} />;
  return <BrowseApp criteria={criteria} />;
}
