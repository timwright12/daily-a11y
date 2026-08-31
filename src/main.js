import { loadCriteria } from "./content/loadCriteria.js";
import { daysSinceEpoch, getTodayIndex, puzzleDayNumber } from "./rotation.js";
import { readState, writeState } from "./storage.js";
import { recordAnswer } from "./gamification/streak.js";
import { markSeen, coverageSummary } from "./gamification/coverage.js";
import { buildShareText } from "./gamification/shareCard.js";
import { renderCriterionContent, wireCheckFeedback } from "./render.js";
import "prismjs/themes/prism.css";
import "prismjs/components/prism-css.js";
import "prismjs/components/prism-javascript.js";

const rawModules = import.meta.glob("./content/criteria/*.json", {
  eager: true,
  import: "default",
});
const rawEntries = Object.values(rawModules);
const criteria = loadCriteria(rawEntries).sort((a, b) =>
  a.id.localeCompare(b.id, undefined, { numeric: true }),
);

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
app.innerHTML = `
  <header>
    <div class="masthead">
      <span class="masthead-mark">Daily Accessibility</span>
      <p id="gamification-status"></p>
    </div>
  </header>
  <main></main>
`;

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

let lastCheckResult = null;

wireCheckFeedback(main, criterion, {
  onAnswered: (isCorrect) => {
    state = { ...state, streak: recordAnswer(state.streak, todayDayNumber) };
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
