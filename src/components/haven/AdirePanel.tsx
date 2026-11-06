const CELL = 120;
const COLUMNS = 3;
const ROWS = 7;

const MOTIFS = [
  <>
    <circle cx="60" cy="60" r="42" pathLength={1} />
    <circle cx="60" cy="60" r="27" pathLength={1} />
    <circle cx="60" cy="60" r="12" pathLength={1} />
  </>,
  <>
    <path d="M14 26h92" pathLength={1} />
    <path d="M14 48h92" pathLength={1} />
    <path d="M14 70h92" pathLength={1} />
    <path d="M14 92h92" pathLength={1} />
  </>,
  <>
    <path d="M60 12l48 48-48 48-48-48z" pathLength={1} />
    <path d="M60 36l24 24-24 24-24-24z" pathLength={1} />
  </>,
  <>
    <path d="M12 42l18-18 18 18 18-18 18 18 18-18 6 6" pathLength={1} />
    <path d="M12 72l18-18 18 18 18-18 18 18 18-18 6 6" pathLength={1} />
    <path d="M12 102l18-18 18 18 18-18 18 18 18-18 6 6" pathLength={1} />
  </>,
];

/** Squares of adire cloth, drawn in once when the home page opens. */
export function AdirePanel() {
  const cells = Array.from({ length: COLUMNS * ROWS }, (_, i) => i);
  return (
    <div className="relative order-2 hidden overflow-hidden lg:block" aria-hidden>
      <svg
        viewBox={`0 0 ${COLUMNS * CELL} ${ROWS * CELL}`}
        preserveAspectRatio="xMinYMin slice"
        className="adire-draw absolute inset-0 h-full w-full"
        fill="none"
        stroke="var(--adire-line)"
        strokeWidth="3"
        strokeLinecap="round"
      >
        {cells.map((i) => {
          const column = i % COLUMNS;
          const row = Math.floor(i / COLUMNS);
          return (
            <g
              key={i}
              transform={`translate(${column * CELL} ${row * CELL})`}
              style={{ "--delay": `${(row + column) * 110}ms` } as React.CSSProperties}
            >
              <path d={`M0 0h${CELL}v${CELL}`} pathLength={1} />
              {MOTIFS[(row * 3 + column) % MOTIFS.length]}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
