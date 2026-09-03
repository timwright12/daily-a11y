// src/components/CodeSpread.jsx
import { useEffect, useRef } from "react";
import Prism from "prismjs";

export default function CodeSpread({ codeExample }) {
  const badRef = useRef(null);
  const goodRef = useRef(null);

  useEffect(() => {
    if (badRef.current) Prism.highlightElement(badRef.current);
    if (goodRef.current) Prism.highlightElement(goodRef.current);
  }, [codeExample]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* border-color is color-mix(in srgb, var(--signal) 30%, var(--rule)) */}
      <div className="rounded-[0.4em] overflow-hidden border border-[#c2a299]">
        <p className="flex items-center gap-[0.5em] font-mono text-[0.75rem] font-semibold tracking-[0.05em] uppercase px-[0.9em] py-[0.6em] text-signal-panel-label bg-signal-bg">
          <span className="text-[0.95em]" aria-hidden="true">
            ✕
          </span>{" "}
          Bad
        </p>
        {/* background: see .code-panel-bad in global.css — must be unlayered
            plain CSS to beat Prism's own unlayered pre[class*="language-"]
            rule, which a Tailwind bg-[...] utility (inside @layer utilities)
            cannot win against regardless of specificity. */}
        <pre className="code-panel-bad m-0 overflow-x-auto p-4 font-mono text-[0.85rem] leading-[1.6]">
          <code ref={badRef} className={`language-${codeExample.lang}`}>
            {codeExample.bad}
          </code>
        </pre>
      </div>
      {/* border-color is color-mix(in srgb, var(--moss) 30%, var(--rule)) */}
      <div className="rounded-[0.4em] overflow-hidden border border-[#abaf9e]">
        <p className="flex items-center gap-[0.5em] font-mono text-[0.75rem] font-semibold tracking-[0.05em] uppercase px-[0.9em] py-[0.6em] text-moss-panel-label bg-moss-bg">
          <span className="text-[0.95em]" aria-hidden="true">
            ✓
          </span>{" "}
          Good
        </p>
        {/* background: see .code-panel-good in global.css — see the .code-panel-bad
            comment above for why this must be unlayered plain CSS. */}
        <pre className="code-panel-good m-0 overflow-x-auto p-4 font-mono text-[0.85rem] leading-[1.6]">
          <code ref={goodRef} className={`language-${codeExample.lang}`}>
            {codeExample.good}
          </code>
        </pre>
      </div>
    </div>
  );
}
