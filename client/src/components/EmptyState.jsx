import { SeerMark } from "./SeerMark";

const SUGGESTIONS = [
  "Where in John does Jesus call himself the vine?",
  "In Genesis, where does God set a rainbow in the cloud?",
  "Which psalm says the Lord is my shepherd?",
];

export function EmptyState({ onPick }) {
  return (
    <section className="empty-state">
      <SeerMark size={168} />
      <h1 className="empty-title">Iddo the Seer</h1>
      <p className="empty-lede">
        Describe a passage you half remember and name its book. Iddo will find
        the verse in the King James Bible.
      </p>
      <ul className="suggestions">
        {SUGGESTIONS.map((s) => (
          <li key={s}>
            <button type="button" className="suggestion" onClick={() => onPick(s)}>
              {s}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
