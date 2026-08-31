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
    <form id="check-form">
      <fieldset>
        <legend id="check-question"></legend>
        <div id="check-choices"></div>
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
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
      <input type="radio" name="check-choice" id="${id}" value="${index}">
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
 * result after the feedback text is set — callers use it to layer in
 * page-specific side effects (e.g. streak tracking) without duplicating the
 * correctness check.
 */
export function wireCheckFeedback(container, criterion, options = {}) {
  const { onAnswered } = options;
  container.querySelector("#check-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const selected = event.target.elements["check-choice"].value;
    if (selected === "") return;

    const isCorrect = Number(selected) === criterion.check.answer;
    container.querySelector("#check-result").textContent = isCorrect
      ? "Correct!"
      : "Not quite — review the explanation above.";

    if (onAnswered) onAnswered(isCorrect);
  });
}
