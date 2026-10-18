import { useState } from "react";

export function Composer({ onSubmit, disabled }) {
  const [prompt, setPrompt] = useState("");

  function submit() {
    const trimmed = prompt.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setPrompt("");
  }

  function handleKeyDown(e) {
    // Enter sends, Shift+Enter adds a new line
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <form
      className="composer"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <label htmlFor="prompt" className="visually-hidden">Ask Iddo</label>
      <textarea
        id="prompt"
        rows={1}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Describe the passage and name its book"
      />
      <button type="submit" className="btn btn-primary" disabled={disabled || !prompt.trim()}>
        Ask
      </button>
    </form>
  );
}
