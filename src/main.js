import { loadCriteria, sortCriteria } from "./content/loadCriteria.js";
import { daysSinceEpoch, getTodayIndex, puzzleDayNumber } from "./rotation.js";
import { readState, writeState } from "./storage.js";
import { recordAnswer } from "./gamification/streak.js";
import { markSeen, coverageSummary } from "./gamification/coverage.js";
import { buildShareText } from "./gamification/shareCard.js";
import {
  renderCriterionContent,
  wireCheckFeedback,
  renderAnsweredState,
  renderMasthead,
} from "./render.js";
import "prismjs/themes/prism.css";
import "prismjs/components/prism-css.js";
import "prismjs/components/prism-javascript.js";

const rawModules = import.meta.glob("./content/criteria/*.json", {
  eager: true,
  import: "default",
});
const rawEntries = Object.values(rawModules);
const criteria = sortCriteria(loadCriteria(rawEntries));

const LAUNCH_DATE = new Date("2026-08-30T00:00:00Z");

const today = new Date();
const todayDayNumber = daysSinceEpoch(today);
const todayPuzzleDay = puzzleDayNumber(today, LAUNCH_DATE);
const todayIndex = getTodayIndex(today, criteria.length);
const criterion = criteria[todayIndex];

let state = readState();
state = { ...state, coverage: markSeen(state.coverage, criterion.id) };
writeState(state);

const app = document.getElementById("app");
renderMasthead(app);
app.insertAdjacentHTML("beforeend", "<main></main>");

const main = document.querySelector("main");
renderCriterionContent(main, criterion);
main.insertAdjacentHTML(
  "beforeend",
  `
  <div class="share">
    <button id="share-button" type="button">Copy today's result</button>
    <p id="share-status" role="status"></p>
  </div>
`,
);

const alreadyAnsweredToday =
  state.lastAnswer !== null &&
  state.lastAnswer.day === todayDayNumber &&
  state.lastAnswer.criterionId === criterion.id;

let lastCheckResult = alreadyAnsweredToday ? state.lastAnswer.correct : null;

if (alreadyAnsweredToday) {
  renderAnsweredState(main, criterion, {
    choice: state.lastAnswer.choice,
    correct: state.lastAnswer.correct,
  });
}

wireCheckFeedback(main, criterion, {
  onAnswered: (isCorrect, choice) => {
    state = {
      ...state,
      streak: recordAnswer(state.streak, todayDayNumber),
      lastAnswer: {
        day: todayDayNumber,
        criterionId: criterion.id,
        choice,
        correct: isCorrect,
      },
    };
    writeState(state);
    lastCheckResult = isCorrect;
    renderGamificationStatus();
  },
});

function renderGamificationStatus() {
  const { seen, total } = coverageSummary(state.coverage, criteria.length);
  document.getElementById("gamification-status").textContent =
    `Streak: ${state.streak.count} day${state.streak.count === 1 ? "" : "s"} — ${seen} of ${total} criteria seen`;
}
renderGamificationStatus();

document.getElementById("share-button").addEventListener("click", async () => {
  const text = buildShareText(criterion, todayPuzzleDay, lastCheckResult);
  const statusEl = document.getElementById("share-status");
  try {
    await navigator.clipboard.writeText(text);
    statusEl.textContent = "Copied to clipboard!";
  } catch {
    statusEl.textContent = text;
  }
});
