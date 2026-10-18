// The Iddo symbol: a scroll between two rollers, drawn in the current text color
export function ScrollMark({ size = 28, strokeWidth = 1.6, lines = true }) {
  return (
    <svg
      className="scroll-mark"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="6" y="5" width="12" height="14" />
      <rect x="4" y="3" width="16" height="3" rx="1.5" />
      <rect x="4" y="18" width="16" height="3" rx="1.5" />
      {lines && <path d="M9 9.5h6M9 12h6M9 14.5h4" />}
    </svg>
  );
}

// A sheet of the scroll: content between an olive roller above and below
export function ScrollSheet({ as: Tag = "div", className = "", children }) {
  return (
    <Tag className={`scroll-sheet ${className}`}>
      <div className="scroll-roller" />
      <div className="scroll-sheet-body">{children}</div>
      <div className="scroll-roller" />
    </Tag>
  );
}
