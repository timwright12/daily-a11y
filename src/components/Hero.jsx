// src/components/Hero.jsx
export default function Hero({ criterion }) {
  return (
    <div className="hero">
      <span className="eyebrow">
        §<span>{criterion.id}</span> · WCAG 2.2
      </span>
      <h1 className="heading-display">{criterion.name}</h1>
      <div className="badges">
        <span className="badge">Level {criterion.level}</span>
        <span className="badge">{criterion.principle}</span>
      </div>
    </div>
  );
}
