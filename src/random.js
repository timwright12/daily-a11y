import { loadCriteria } from "./content/loadCriteria.js";
import { randomIndex } from "./rotation.js";
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

const criterion = criteria[randomIndex(criteria.length)];

const app = document.getElementById("app");
app.innerHTML = `
  <header>
    <div class="masthead">
      <span class="masthead-mark">Daily Accessibility</span>
      <span class="admin-label">Random criterion</span>
    </div>
  </header>
  <main></main>
`;

const main = document.querySelector("main");
renderCriterionContent(main, criterion);
wireCheckFeedback(main, criterion);

main.insertAdjacentHTML(
  "beforeend",
  `
  <div class="share">
    <a class="reroll-link" href="/random/">Show me another</a>
  </div>
`,
);
