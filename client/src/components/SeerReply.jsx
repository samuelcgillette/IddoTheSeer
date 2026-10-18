import { SeerMark } from "./SeerMark";

// Server replies look like: John 15:5 - "I am the vine..."\nExplanation
function parseReply(text) {
  const [head, ...rest] = text.split("\n");
  const match = head.match(/^(.+?) - "(.*)"$/);
  if (!match) return null;
  // the page text keeps its verse number ("1 I am the true vine"); the reference already shows it
  const verse = match[2].replace(/^\d+\s+/, "");
  return { reference: match[1], verse, explanation: rest.join("\n").trim() };
}

export function SeerReply({ text, error = false }) {
  const parsed = error ? null : parseReply(text);

  return (
    <div className="message message--seer">
      <SeerMark size={32} />
      {parsed ? (
        <article className="leaf">
          <h3 className="leaf-reference">{parsed.reference}</h3>
          <blockquote className="leaf-verse">{parsed.verse}</blockquote>
          {parsed.explanation && <p className="leaf-explanation">{parsed.explanation}</p>}
        </article>
      ) : (
        <p className={error ? "seer-note seer-note--error" : "seer-note"}>{text}</p>
      )}
    </div>
  );
}

export function SeerSearching() {
  return (
    <div className="message message--seer" aria-live="polite">
      <SeerMark size={32} searching />
      <p className="seer-note seer-note--muted">Searching the scriptures…</p>
    </div>
  );
}
