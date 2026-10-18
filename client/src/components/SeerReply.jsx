import { ScrollMark, ScrollSheet } from "./ScrollMark";

// Server replies look like: John 15:5 - "I am the vine..."\nExplanation
function parseReply(text) {
  const [head, ...rest] = text.split("\n");
  const match = head.match(/^(.+?) - "(.*)"$/);
  if (!match) return null;
  // the page text keeps its verse number ("1 I am the true vine"); the reference already shows it
  const verse = match[2].replace(/^\d+\s+/, "");
  return { reference: match[1], verse, explanation: rest.join("\n").trim() };
}

// Follow-up guidance for the server's plain-text replies
const HINTS = [
  ["Please include the book", "For example: “In Luke, where does the shepherd leave the ninety and nine?”"],
  ["could not be found", "Try other words from the verse, or older King James wording."],
];

function hintFor(text) {
  return HINTS.find(([phrase]) => text.includes(phrase))?.[1];
}

function SeerAvatar({ variant = "default" }) {
  return (
    <span className={`seer-avatar seer-avatar--${variant}`}>
      {variant === "error" ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7.5v5.5M12 16.5v.01" />
        </svg>
      ) : (
        <ScrollMark size={20} strokeWidth={1.7} lines={false} />
      )}
    </span>
  );
}

export function SeerReply({ text, error = false, onRetry }) {
  if (error) {
    return (
      <div className="message message--seer">
        <SeerAvatar variant="error" />
        <div className="seer-note seer-note--error">
          <p>{text}</p>
          {onRetry && (
            <button type="button" className="btn btn-outline" onClick={onRetry}>
              Ask again
            </button>
          )}
        </div>
      </div>
    );
  }

  const parsed = parseReply(text);
  if (!parsed) {
    const hint = hintFor(text);
    return (
      <div className="message message--seer">
        <SeerAvatar />
        <div className="seer-note">
          <p>{text}</p>
          {hint && <p className="seer-hint">{hint}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="message message--seer">
      <SeerAvatar />
      <ScrollSheet as="article" className="verse-sheet">
        <h3 className="verse-reference">{parsed.reference}</h3>
        <blockquote className="verse-text">{parsed.verse}</blockquote>
        {parsed.explanation && <p className="verse-explanation">{parsed.explanation}</p>}
      </ScrollSheet>
    </div>
  );
}

export function SeerSearching() {
  return (
    <div className="message message--seer message--searching" aria-live="polite">
      <SeerAvatar variant="searching" />
      <p className="seer-searching">Unrolling the scroll…</p>
    </div>
  );
}
