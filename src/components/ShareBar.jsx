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
    <div className="share">
      <button type="button" className="btn-outline" onClick={handleClick}>
        Copy today&apos;s result
      </button>
      <p className="share-status" role="status">
        {status}
      </p>
    </div>
  );
}
