// src/components/RerollLink.jsx
export default function RerollLink() {
  return (
    <div className="flex items-center gap-4 flex-wrap mt-12 pt-10 border-t border-rule">
      <a
        className="inline-flex items-center font-body font-semibold text-[0.95rem] text-ink bg-transparent border border-ink rounded-[0.3em] px-[1.4em] py-[0.7em] no-underline cursor-pointer hover:bg-ink hover:text-paper hover:border-ink"
        href="/daily-a11y/random/"
      >
        Show me another
      </a>
    </div>
  );
}
