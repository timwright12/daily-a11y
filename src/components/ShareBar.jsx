// src/components/ShareBar.jsx
import { useRef, useState } from "react";
import { SITE_URL } from "../gamification/shareCard.js";

const iconButtonClass =
  "inline-flex items-center justify-center w-[2.6em] h-[2.6em] text-ink bg-transparent border border-ink rounded-[0.3em] cursor-pointer hover:bg-ink hover:text-paper hover:border-ink";

export default function ShareBar({ shareText }) {
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState("");
  const triggerRef = useRef(null);

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(shareText);
      setStatus("Copied to clipboard!");
    } catch {
      setStatus(shareText);
    }
  }

  function handleTwitterClick() {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  async function handleLinkedInClick() {
    try {
      await navigator.clipboard.writeText(shareText);
      setStatus("Text copied — paste it into your LinkedIn post.");
    } catch {
      setStatus(shareText);
    }
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SITE_URL)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  function collapse() {
    setExpanded(false);
    setStatus("");
  }

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      collapse();
      triggerRef.current?.focus();
    }
  }

  return (
    <div className="no-print flex items-center gap-4 flex-wrap mt-12 pt-10 border-t border-rule">
      <button
        type="button"
        ref={triggerRef}
        aria-expanded={expanded}
        aria-controls="share-menu"
        className="inline-flex items-center font-body font-semibold text-[0.95rem] text-ink bg-transparent border border-ink rounded-[0.3em] px-[1.4em] py-[0.7em] cursor-pointer hover:bg-ink hover:text-paper hover:border-ink"
        onClick={() => (expanded ? collapse() : setExpanded(true))}
      >
        Share my progress
      </button>
      <div
        id="share-menu"
        role="group"
        aria-label="Share options"
        className={`share-menu flex items-center gap-3 ${
          expanded
            ? "opacity-100 translate-x-0"
            : "opacity-0 -translate-x-2 pointer-events-none absolute"
        }`}
      >
        <button
          type="button"
          aria-label="Share on X (Twitter)"
          className={iconButtonClass}
          onClick={handleTwitterClick}
          onKeyDown={handleKeyDown}
        >
          <svg
            viewBox="0 0 24 24"
            width="1.1em"
            height="1.1em"
            aria-hidden="true"
            focusable="false"
          >
            <path
              fill="currentColor"
              d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
            />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Share on LinkedIn"
          className={iconButtonClass}
          onClick={handleLinkedInClick}
          onKeyDown={handleKeyDown}
        >
          <svg
            viewBox="0 0 24 24"
            width="1.1em"
            height="1.1em"
            aria-hidden="true"
            focusable="false"
          >
            <path
              fill="currentColor"
              d="M4.983 3.5a2.5 2.5 0 1 1 0 5.001 2.5 2.5 0 0 1 0-5.001M.5 8.75h4.5V23H.5zm7 0h4.313v1.955h.06c.601-1.14 2.07-2.34 4.26-2.34 4.556 0 5.397 3 5.397 6.9V23h-4.5v-6.75c0-1.61-.03-3.68-2.244-3.68-2.246 0-2.59 1.755-2.59 3.567V23h-4.496z"
            />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Copy today's result"
          className={iconButtonClass}
          onClick={copyToClipboard}
          onKeyDown={handleKeyDown}
        >
          <svg
            viewBox="0 0 24 24"
            width="1.1em"
            height="1.1em"
            aria-hidden="true"
            focusable="false"
          >
            <path
              fill="currentColor"
              d="M15.5 2h-8A1.5 1.5 0 0 0 6 3.5V6H3.5A1.5 1.5 0 0 0 2 7.5v13A1.5 1.5 0 0 0 3.5 22h11a1.5 1.5 0 0 0 1.5-1.5V18h2.5a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 18.5 2zM14 20H4V8h10zm4-4h-2V7.5A1.5 1.5 0 0 0 14.5 6H8V4h10z"
            />
          </svg>
        </button>
      </div>
      <p className="font-mono text-[0.85rem] text-ink-quiet m-0" role="status">
        {status}
      </p>
    </div>
  );
}
