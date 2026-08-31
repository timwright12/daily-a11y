import { loadCriteria, sortCriteria } from "./content/loadCriteria.js";
import { randomIndex } from "./rotation.js";
import {
  renderCriterionContent,
  wireCheckFeedback,
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

const criterion = criteria[randomIndex(criteria.length)];

const app = document.getElementById("app");
renderMasthead(app, "Random criterion");
app.insertAdjacentHTML("beforeend", "<main></main>");

const main = document.querySelector("main");
renderCriterionContent(main, criterion);
wireCheckFeedback(main, criterion);

main.insertAdjacentHTML(
  "beforeend",
  `
  <div class="share">
    <a class="reroll-link" href="random/">Show me another</a>
  </div>
`,
);
