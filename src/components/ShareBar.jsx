// src/components/ShareBar.jsx
import { useState } from "react";

export default function ShareBar({ shareText }) {
  const [status, setStatus] = useState("");

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(shareText);
      setStatus("Copied to clipboard!");
    } catch {
      setStatus(shareText);
    }
  }

  return (
    <div className="flex items-center gap-4 flex-wrap mt-12 pt-10 border-t border-rule">
      <button
        type="button"
        className="inline-flex items-center font-body font-semibold text-[0.95rem] text-ink bg-transparent border border-ink rounded-[0.3em] px-[1.4em] py-[0.7em] no-underline cursor-pointer hover:bg-ink hover:text-paper hover:border-ink"
        onClick={handleClick}
      >
        Copy today&apos;s result
      </button>
      <p className="font-mono text-[0.85rem] text-ink-quiet m-0" role="status">
        {status}
      </p>
    </div>
  );
}
