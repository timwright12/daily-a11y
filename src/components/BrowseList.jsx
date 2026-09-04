// src/components/BrowseList.jsx
const selectClass =
  "font-body text-[0.85rem] text-ink border border-rule rounded-none px-2 py-1 bg-transparent";

export default function BrowseList({
  criteria,
  activeCriterionId,
  filters,
  onQueryChange,
  onLevelChange,
  onPrincipleChange,
}) {
  return (
    <nav
      className="border-r border-rule h-[calc(100vh-4.5rem)] overflow-y-auto sticky top-0 max-[720px]:static max-[720px]:h-auto max-[720px]:max-h-[20rem] max-[720px]:border-r-0 max-[720px]:border-b max-[720px]:border-rule"
      aria-label="WCAG success criteria"
    >
      <form
        role="search"
        className="flex flex-col gap-2 px-5 pt-3 pb-2 border-b border-rule"
        onSubmit={(event) => event.preventDefault()}
      >
        <label htmlFor="browse-search" className="sr-only">
          Search criteria
        </label>
        <input
          id="browse-search"
          type="search"
          value={filters.query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search criteria"
          className="font-body text-[0.9rem] text-ink border border-rule rounded-none px-2 py-1 bg-transparent"
        />
        <div className="flex gap-2 flex-wrap">
          <div className="flex flex-col gap-1">
            <label htmlFor="browse-filter-level" className="sr-only">
              Level
            </label>
            <select
              id="browse-filter-level"
              value={filters.level}
              onChange={(event) => onLevelChange(event.target.value)}
              className={selectClass}
            >
              <option value="">All levels</option>
              <option value="A">A</option>
              <option value="AA">AA</option>
              <option value="AAA">AAA</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="browse-filter-principle" className="sr-only">
              Principle
            </label>
            <select
              id="browse-filter-principle"
              value={filters.principle}
              onChange={(event) => onPrincipleChange(event.target.value)}
              className={selectClass}
            >
              <option value="">All principles</option>
              <option value="Perceivable">Perceivable</option>
              <option value="Operable">Operable</option>
              <option value="Understandable">Understandable</option>
              <option value="Robust">Robust</option>
            </select>
          </div>
        </div>
      </form>
      {criteria.length === 0 ? (
        <p className="px-5 py-3 text-[0.9rem] text-ink-quiet">
          No criteria match the current filters.
        </p>
      ) : (
        <ul className="list-none m-0 py-3 px-0">
          {criteria.map((criterion) => {
            const isActive = criterion.id === activeCriterionId;
            return (
              <li key={criterion.id}>
                <a
                  href={`#${criterion.id}`}
                  className={`flex items-baseline gap-[0.6rem] w-full text-left font-body text-[0.95rem] text-ink no-underline border-0 border-l-[3px] rounded-none px-5 py-[0.55rem] cursor-pointer hover:bg-signal-bg ${isActive ? "is-active bg-signal-bg border-l-signal" : "bg-transparent border-l-transparent"}`}
                  aria-current={isActive ? "true" : undefined}
                >
                  <span className="shrink-0 m-0 font-mono text-[0.8rem] text-ink-quiet tracking-[0.01em]">
                    {criterion.id}
                  </span>
                  <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                    {criterion.name}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </nav>
  );
}
