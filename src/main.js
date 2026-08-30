import { loadCriteria } from './content/loadCriteria.js';
import { daysSinceEpoch, getTodayIndex } from './rotation.js';
import { readState, writeState } from './storage.js';
import { recordAnswer } from './gamification/streak.js';
import { markSeen, coverageSummary } from './gamification/coverage.js';
import { buildShareText } from './gamification/shareCard.js';
import Prism from 'prismjs';
import 'prismjs/components/prism-css.js';
import 'prismjs/components/prism-javascript.js';

const rawModules = import.meta.glob('./content/criteria/*.json', { eager: true, import: 'default' });
const rawEntries = Object.values(rawModules);
const criteria = loadCriteria(rawEntries).sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

const today = new Date();
const todayDayNumber = daysSinceEpoch(today);
const todayIndex = getTodayIndex(today, criteria.length);
const criterion = criteria[todayIndex];

let state = readState();
state = { ...state, coverage: markSeen(state.coverage, criterion.id) };
writeState(state);

const app = document.getElementById('app');
app.innerHTML = `
  <header>
    <p id="gamification-status"></p>
  </header>
  <main>
    <h1><span id="criterion-id"></span> <span id="criterion-name"></span></h1>
    <p>
      <span id="level-badge" class="badge"></span>
      <span id="principle-badge" class="badge"></span>
    </p>
    <section aria-labelledby="explanation-heading">
      <h2 id="explanation-heading">What this means</h2>
      <p id="explanation"></p>
    </section>
    <section aria-labelledby="who-heading">
      <h2 id="who-heading">Who it affects</h2>
      <p id="who-it-affects"></p>
    </section>
    <section aria-labelledby="code-heading">
      <h2 id="code-heading">Code example</h2>
      <h3>Bad</h3>
      <pre><code id="code-bad"></code></pre>
      <h3>Good</h3>
      <pre><code id="code-good"></code></pre>
    </section>
    <section aria-labelledby="test-heading">
      <h2 id="test-heading">How to test it</h2>
      <p id="how-to-test"></p>
    </section>
    <section aria-labelledby="check-heading">
      <h2 id="check-heading">Check your understanding</h2>
      <form id="check-form">
        <p id="check-question"></p>
        <div id="check-choices"></div>
        <button type="submit">Submit answer</button>
      </form>
      <p id="check-result" role="status"></p>
    </section>
    <button id="share-button" type="button">Copy today's result</button>
    <p id="share-status" role="status"></p>
  </main>
`;

document.getElementById('criterion-id').textContent = criterion.id;
document.getElementById('criterion-name').textContent = criterion.name;
document.getElementById('level-badge').textContent = `Level ${criterion.level}`;
document.getElementById('principle-badge').textContent = criterion.principle;
document.getElementById('explanation').textContent = criterion.explanation;
document.getElementById('who-it-affects').textContent = criterion.whoItAffects;
document.getElementById('how-to-test').textContent = criterion.howToTest;

const codeBad = document.getElementById('code-bad');
const codeGood = document.getElementById('code-good');
codeBad.textContent = criterion.codeExample.bad;
codeGood.textContent = criterion.codeExample.good;
codeBad.className = `language-${criterion.codeExample.lang}`;
codeGood.className = `language-${criterion.codeExample.lang}`;
Prism.highlightElement(codeBad);
Prism.highlightElement(codeGood);

const choicesContainer = document.getElementById('check-choices');
document.getElementById('check-question').textContent = criterion.check.question;
criterion.check.choices.forEach((choice, index) => {
  const id = `check-choice-${index}`;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <input type="radio" name="check-choice" id="${id}" value="${index}">
    <label for="${id}"></label>
  `;
  wrapper.querySelector('label').textContent = choice;
  choicesContainer.appendChild(wrapper);
});

let lastCheckResult = null;

document.getElementById('check-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const selected = event.target.elements['check-choice'].value;
  if (selected === '') return;

  const isCorrect = Number(selected) === criterion.check.answer;
  const resultEl = document.getElementById('check-result');
  resultEl.textContent = isCorrect ? 'Correct!' : 'Not quite — review the explanation above.';

  state = { ...state, streak: recordAnswer(state.streak, todayDayNumber) };
  writeState(state);
  lastCheckResult = isCorrect;
  renderGamificationStatus();
});

function renderGamificationStatus() {
  const { seen, total } = coverageSummary(state.coverage, criteria.length);
  document.getElementById('gamification-status').textContent =
    `Streak: ${state.streak.count} day${state.streak.count === 1 ? '' : 's'} — ${seen} of ${total} criteria seen`;
}
renderGamificationStatus();

document.getElementById('share-button').addEventListener('click', async () => {
  const text = buildShareText(criterion, todayDayNumber, lastCheckResult);
  const statusEl = document.getElementById('share-status');
  try {
    await navigator.clipboard.writeText(text);
    statusEl.textContent = 'Copied to clipboard!';
  } catch {
    statusEl.textContent = text;
  }
});
