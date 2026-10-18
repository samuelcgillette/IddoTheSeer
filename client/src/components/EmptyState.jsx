import { ScrollMark } from "./ScrollMark";

const SUGGESTIONS = [
  { label: "Where in John is the true vine?", prompt: "Where in John does Jesus call himself the vine?" },
  { label: "The rainbow in Genesis", prompt: "In Genesis, where does God set the rainbow in the cloud?" },
  { label: "The Lord is my shepherd", prompt: "Which psalm says the Lord is my shepherd?" },
];

export function EmptyState({ onPick }) {
  return (
    <section className="empty-state">
      <span className="empty-mark">
        <ScrollMark size={72} strokeWidth={1.1} />
      </span>
      <figure className="empty-quote">
        <blockquote>Ask, and it shall be given you; seek, and ye shall find.</blockquote>
        <figcaption>Matthew 7:7</figcaption>
      </figure>
      <p className="empty-lede">
        Describe a passage you half remember and name its book. Iddo searches
        the King James Bible and quotes it back exactly.
      </p>
      <div className="suggestions">
        {SUGGESTIONS.map((s) => (
          <button key={s.label} type="button" className="suggestion" onClick={() => onPick(s.prompt)}>
            {s.label}
          </button>
        ))}
      </div>
    </section>
  );
}
