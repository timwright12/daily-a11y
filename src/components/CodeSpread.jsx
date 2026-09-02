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
    <div className="code-spread">
      <div className="code-panel code-panel-bad">
        <p className="code-panel-label">
          <span className="mark" aria-hidden="true">
            ✕
          </span>{" "}
          Bad
        </p>
        <pre>
          <code ref={badRef} className={`language-${codeExample.lang}`}>
            {codeExample.bad}
          </code>
        </pre>
      </div>
      <div className="code-panel code-panel-good">
        <p className="code-panel-label">
          <span className="mark" aria-hidden="true">
            ✓
          </span>{" "}
          Good
        </p>
        <pre>
          <code ref={goodRef} className={`language-${codeExample.lang}`}>
            {codeExample.good}
          </code>
        </pre>
      </div>
    </div>
  );
}
