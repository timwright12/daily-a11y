/**
 * Component convention for this codebase: a "component" here is a plain
 * function that owns one template string and mutates a caller-supplied
 * container via innerHTML + querySelector, with no internal state and no
 * framework. Each entry point (main.js, admin.js, random.js) composes these
 * functions rather than each owning its own markup. If a future page needs
 * a component with internal state or lifecycle (e.g. something that updates
 * itself without a full re-render), that's the signal this convention has
 * been outgrown — revisit introducing a minimal framework at that point
 * rather than bolting state onto this pattern.
 */

import Prism from "prismjs";

const CONTENT_TEMPLATE = `
  <div class="hero">
    <span class="eyebrow">§<span id="criterion-id"></span> · WCAG 2.2</span>
    <h1 id="criterion-name"></h1>
    <div class="badges">
      <span id="level-badge" class="badge"></span>
      <span id="principle-badge" class="badge"></span>
    </div>
  </div>
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
    <div class="code-spread">
      <div class="code-panel code-panel-bad">
        <p class="code-panel-label"><span class="mark" aria-hidden="true">✕</span> Bad</p>
        <pre><code id="code-bad"></code></pre>
      </div>
      <div class="code-panel code-panel-good">
        <p class="code-panel-label"><span class="mark" aria-hidden="true">✓</span> Good</p>
        <pre><code id="code-good"></code></pre>
      </div>
    </div>
  </section>
  <section aria-labelledby="test-heading">
    <h2 id="test-heading">How to test it</h2>
    <p id="how-to-test"></p>
  </section>
  <section aria-labelledby="check-heading">
    <h2 id="check-heading">Check your understanding</h2>
    <p id="check-already-answered" hidden>
      You already answered today's knowledge check.
    </p>
    <form id="check-form">
      <fieldset>
        <legend id="check-question"></legend>
        <ul id="check-choices"></ul>
      </fieldset>
      <button type="submit">Submit answer</button>
    </form>
    <p id="check-result" role="status"></p>
  </section>
`;

/**
 * Renders one criterion's full content into `container`, replacing its
 * contents. Returns the container so callers can query rendered elements
 * (e.g. to wire up a submit handler with page-specific side effects).
 */
export function renderCriterionContent(container, criterion) {
  container.innerHTML = CONTENT_TEMPLATE;

  container.querySelector("#criterion-id").textContent = criterion.id;
  container.querySelector("#criterion-name").textContent = criterion.name;
  container.querySelector("#level-badge").textContent =
    `Level ${criterion.level}`;
  container.querySelector("#principle-badge").textContent = criterion.principle;
  container.querySelector("#explanation").textContent = criterion.explanation;
  container.querySelector("#who-it-affects").textContent =
    criterion.whoItAffects;
  container.querySelector("#how-to-test").textContent = criterion.howToTest;

  const codeBad = container.querySelector("#code-bad");
  const codeGood = container.querySelector("#code-good");
  codeBad.textContent = criterion.codeExample.bad;
  codeGood.textContent = criterion.codeExample.good;
  codeBad.className = `language-${criterion.codeExample.lang}`;
  codeGood.className = `language-${criterion.codeExample.lang}`;
  Prism.highlightElement(codeBad);
  Prism.highlightElement(codeGood);

  const choicesContainer = container.querySelector("#check-choices");
  container.querySelector("#check-question").textContent =
    criterion.check.question;
  criterion.check.choices.forEach((choice, index) => {
    const id = `check-choice-${index}`;
    const wrapper = document.createElement("li");
    wrapper.innerHTML = `
      <input type="radio" name="check-choice" id="${id}" value="${index}" required>
      <label for="${id}"></label>
    `;
    wrapper.querySelector("label").textContent = choice;
    choicesContainer.appendChild(wrapper);
  });

  return container;
}

/**
 * Wires the comprehension check form rendered inside `container` (by
 * renderCriterionContent) to show correct/incorrect feedback on submit.
 * `options.onAnswered`, if provided, is called with the boolean correctness
 * result and the selected choice index after the feedback text is set —
 * callers use it to layer in page-specific side effects (e.g. streak
 * tracking, persisting the answer) without duplicating the correctness
 * check.
 */
export function wireCheckFeedback(container, criterion, options = {}) {
  const { onAnswered } = options;
  container.querySelector("#check-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const selected = event.target.elements["check-choice"].value;
    if (selected === "") return;

    const choice = Number(selected);
    const isCorrect = choice === criterion.check.answer;
    container.querySelector("#check-result").textContent = isCorrect
      ? "Correct!"
      : "Not quite — review the explanation above.";

    if (onAnswered) onAnswered(isCorrect, choice);
  });
}

/**
 * Restores the comprehension check form rendered inside `container` (by
 * renderCriterionContent) to reflect an answer already given today: shows
 * the "already answered" message, pre-checks and disables the persisted
 * choice, disables the remaining inputs and submit button, and shows the
 * matching result text. Callers decide whether today was already answered
 * (see storage.js's lastAnswer) — this function only renders that state.
 */
export function renderAnsweredState(container, criterion, { choice, correct }) {
  container.querySelector("#check-already-answered").hidden = false;

  const radios = container.querySelectorAll('input[type="radio"]');
  radios.forEach((radio, index) => {
    radio.checked = index === choice;
    radio.disabled = true;
  });
  container.querySelector('button[type="submit"]').disabled = true;

  container.querySelector("#check-result").textContent = correct
    ? "Correct!"
    : "Not quite — review the explanation above.";
}

/**
 * Renders the shared site header into `container`. Pass a `label` string
 * for pages with a static subtitle (admin, random); omit it for the daily
 * page, which instead shows a live gamification-status placeholder that the
 * caller populates itself.
 */
export function renderMasthead(container, label = null) {
  const secondary = label
    ? `<span class="admin-label">${label}</span>`
    : `<p id="gamification-status"></p>`;
  container.innerHTML = `
    <header>
      <div class="masthead">
        <a href="https://timwright12.github.io/daily-a11y/" class="masthead-mark">Daily Accessibility</a>
        ${secondary}
      </div>
    </header>
  `;
}
