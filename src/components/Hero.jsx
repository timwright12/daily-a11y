// src/components/Hero.jsx
export default function Hero({ criterion }) {
  return (
    <div className="hero mb-12">
      <span className="block font-mono text-[0.85rem] font-semibold tracking-[0.08em] uppercase text-signal mb-3">
        §<span>{criterion.id}</span> · WCAG 2.2
      </span>
      <h1 className="font-display font-medium text-[clamp(2.25rem,5vw+1rem,3.5rem)] leading-[1.08] tracking-[-0.01em] mb-4">
        {criterion.name}
      </h1>
      <div className="flex gap-[0.6rem] flex-wrap">
        <span className="inline-flex items-center font-mono text-xs font-medium tracking-[0.03em] text-ink-quiet border border-rule rounded-[0.2em] px-[0.6em] py-[0.25em]">
          Level {criterion.level}
        </span>
        <span className="inline-flex items-center font-mono text-xs font-medium tracking-[0.03em] text-ink-quiet border border-rule rounded-[0.2em] px-[0.6em] py-[0.25em]">
          {criterion.principle}
        </span>
      </div>
    </div>
  );
}
