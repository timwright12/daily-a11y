// src/components/CriterionApp.jsx
import { useState, useEffect, useMemo } from "react";
import Hero from "./Hero.jsx";
import CodeSpread from "./CodeSpread.jsx";
import ComprehensionCheck from "./ComprehensionCheck.jsx";
import ShareBar from "./ShareBar.jsx";
import RerollLink from "./RerollLink.jsx";
import AdminList from "./AdminList.jsx";
import {
  daysSinceEpoch,
  getTodayIndex,
  puzzleDayNumber,
  randomIndex,
} from "../rotation.js";
import { readState, writeState } from "../storage.js";
import { recordAnswer } from "../gamification/streak.js";
import { markSeen, coverageSummary } from "../gamification/coverage.js";
import { buildShareText } from "../gamification/shareCard.js";

const LAUNCH_DATE = new Date("2026-08-30T00:00:00Z");

function CriterionContent({ criterion, initialAnswer, onAnswered }) {
  return (
    <>
      <Hero criterion={criterion} />
      <section aria-labelledby="explanation-heading">
        <h2 id="explanation-heading">What this means</h2>
        <p>{criterion.explanation}</p>
      </section>
      <section aria-labelledby="who-heading">
        <h2 id="who-heading">Who it affects</h2>
        <p>{criterion.whoItAffects}</p>
      </section>
      <section aria-labelledby="code-heading">
        <h2 id="code-heading">Code example</h2>
        <CodeSpread codeExample={criterion.codeExample} />
      </section>
      <section aria-labelledby="test-heading">
        <h2 id="test-heading">How to test it</h2>
        <p>{criterion.howToTest}</p>
      </section>
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
  const todayPuzzleDay = useMemo(
    () => puzzleDayNumber(today, LAUNCH_DATE),
    [today],
  );
  const todayIndex = useMemo(
    () => getTodayIndex(today, criteria.length),
    [today, criteria.length],
  );
  const criterion = criteria[todayIndex];

  const [state, setState] = useState(() => {
    const initial = readState();
    const withCoverage = {
      ...initial,
      coverage: markSeen(initial.coverage, criterion.id),
    };
    writeState(withCoverage);
    return withCoverage;
  });

  const alreadyAnsweredToday =
    state.lastAnswer !== null &&
    state.lastAnswer.day === todayDayNumber &&
    state.lastAnswer.criterionId === criterion.id;

  const [lastCheckResult, setLastCheckResult] = useState(
    alreadyAnsweredToday ? state.lastAnswer.correct : null,
  );

  function handleAnswered(isCorrect, choice) {
    const nextState = {
      ...state,
      streak: recordAnswer(state.streak, todayDayNumber),
      lastAnswer: {
        day: todayDayNumber,
        criterionId: criterion.id,
        choice,
        correct: isCorrect,
      },
    };
    writeState(nextState);
    setState(nextState);
    setLastCheckResult(isCorrect);
  }

  const { seen, total } = coverageSummary(state.coverage, criteria.length);
  const statusText = `Streak: ${state.streak.count} day${state.streak.count === 1 ? "" : "s"} — ${seen} of ${total} criteria seen`;
  const shareText = buildShareText(criterion, todayPuzzleDay, lastCheckResult);

  return (
    <>
      <p className="label-mono">{statusText}</p>
      <main>
        <CriterionContent
          criterion={criterion}
          initialAnswer={
            alreadyAnsweredToday
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
  const [criterion] = useState(() => criteria[randomIndex(criteria.length)]);

  return (
    <main>
      <CriterionContent criterion={criterion} initialAnswer={null} />
      <RerollLink />
    </main>
  );
}

function BrowseApp({ criteria }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className="admin-layout">
      <AdminList
        criteria={criteria}
        activeCriterionId={selected ? selected.id : null}
        onSelect={setSelected}
      />
      <main className="admin-content">
        {selected ? (
          <CriterionContent criterion={selected} initialAnswer={null} />
        ) : (
          <>
            <h1 className="admin-placeholder-heading heading-display">
              Browse WCAG success criteria
            </h1>
            <p className="admin-placeholder">
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
