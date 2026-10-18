// The seer's open eye inside a lamplit halo; the halo breathes while he is searching
export function SeerMark({ size = 40, searching = false }) {
  return (
    <span
      className={`seer-mark${searching ? " seer-mark--searching" : ""}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <g className="seer-mark-rays">
          <path d="M32 9v7" />
          <path d="M19 13.5l3.2 5.6" />
          <path d="M45 13.5l-3.2 5.6" />
        </g>
        <path className="seer-mark-lid" d="M9 35c6.5-9 14.2-13.5 23-13.5S48.5 26 55 35c-6.5 9-14.2 13.5-23 13.5S15.5 44 9 35z" />
        <circle className="seer-mark-iris" cx="32" cy="35" r="8.5" />
        <circle className="seer-mark-pupil" cx="32" cy="35" r="3.6" />
        <circle className="seer-mark-glint" cx="34.6" cy="32.4" r="1.4" />
      </svg>
    </span>
  );
}
