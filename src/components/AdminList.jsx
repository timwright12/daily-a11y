// src/components/AdminList.jsx
export default function AdminList({ criteria, activeCriterionId, onSelect }) {
  return (
    <nav className="admin-list" aria-label="WCAG success criteria">
      <ul>
        {criteria.map((criterion) => {
          const isActive = criterion.id === activeCriterionId;
          return (
            <li key={criterion.id}>
              <button
                type="button"
                className={`admin-list-item${isActive ? " is-active" : ""}`}
                aria-current={isActive ? "true" : undefined}
                onClick={() => onSelect(criterion)}
              >
                <span className="admin-list-id label-mono">{criterion.id}</span>
                <span className="admin-list-name">{criterion.name}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
