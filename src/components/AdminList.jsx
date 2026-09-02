// src/components/AdminList.jsx
export default function AdminList({ criteria, activeCriterionId, onSelect }) {
  return (
    <nav
      className="border-r border-rule h-[calc(100vh-4.5rem)] overflow-y-auto sticky top-0 max-[720px]:static max-[720px]:h-auto max-[720px]:max-h-[20rem] max-[720px]:border-r-0 max-[720px]:border-b max-[720px]:border-rule"
      aria-label="WCAG success criteria"
    >
      <ul className="list-none m-0 py-3 px-0">
        {criteria.map((criterion) => {
          const isActive = criterion.id === activeCriterionId;
          return (
            <li key={criterion.id}>
              <button
                type="button"
                className={`flex items-baseline gap-[0.6rem] w-full text-left font-body text-[0.95rem] text-ink bg-transparent border-0 border-l-[3px] rounded-none px-5 py-[0.55rem] cursor-pointer hover:bg-signal-bg ${isActive ? "is-active bg-signal-bg border-l-signal" : "border-l-transparent"}`}
                aria-current={isActive ? "true" : undefined}
                onClick={() => onSelect(criterion)}
              >
                <span className="shrink-0 m-0 font-mono text-[0.8rem] text-ink-quiet tracking-[0.01em]">
                  {criterion.id}
                </span>
                <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                  {criterion.name}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
