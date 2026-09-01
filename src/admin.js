import { loadCriteria, sortCriteria } from "./content/loadCriteria.js";
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

const app = document.getElementById("app");
renderMasthead(app, "Browse criteria");
app.insertAdjacentHTML(
  "beforeend",
  `
  <div class="admin-layout">
    <nav class="admin-list" aria-label="WCAG success criteria">
      <ul id="criteria-list"></ul>
    </nav>
    <main id="admin-content" class="admin-content">
      <h1 class="admin-placeholder-heading heading-display">Browse WCAG success criteria</h1>
      <p class="admin-placeholder">Select a criterion from the list to preview it.</p>
    </main>
  </div>
`,
);

const list = document.getElementById("criteria-list");
criteria.forEach((criterion) => {
  const item = document.createElement("li");
  const button = document.createElement("button");
  button.type = "button";
  button.className = "admin-list-item";
  button.dataset.criterionId = criterion.id;
  button.innerHTML = `<span class="admin-list-id label-mono"></span><span class="admin-list-name"></span>`;
  button.querySelector(".admin-list-id").textContent = criterion.id;
  button.querySelector(".admin-list-name").textContent = criterion.name;
  item.appendChild(button);
  list.appendChild(item);
});

const content = document.getElementById("admin-content");

function showCriterion(criterion) {
  renderCriterionContent(content, criterion);
  wireCheckFeedback(content, criterion);

  list.querySelectorAll(".admin-list-item").forEach((button) => {
    const isActive = button.dataset.criterionId === criterion.id;
    button.classList.toggle("is-active", isActive);
    if (isActive) {
      button.setAttribute("aria-current", "true");
    } else {
      button.removeAttribute("aria-current");
    }
  });
}

list.addEventListener("click", (event) => {
  const button = event.target.closest(".admin-list-item");
  if (!button) return;
  const criterion = criteria.find((c) => c.id === button.dataset.criterionId);
  showCriterion(criterion);
});
