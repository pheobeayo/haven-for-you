import type { CSSProperties } from "react";

export type ArtVariant = "doorway" | "circle" | "routes" | "weave" | "cloth";

const delay = (ms: number) => ({ "--art-delay": `${ms}ms` }) as CSSProperties;

/** Nested arches open out from a warm light: arriving somewhere safe. */
function Doorway() {
  return (
    <g fill="none" stroke="var(--art-line)" strokeWidth="5" strokeLinecap="round">
      {[0, 1, 2, 3, 4].map((i) => {
        const width = 90 + i * 62;
        const left = 200 - width / 2;
        const right = 200 + width / 2;
        const top = 390 - width / 2 - i * 8;
        return (
          <path
            key={i}
            className="art-fade"
            style={delay(i * 700)}
            d={`M${left} 640V${top + width / 2}a${width / 2} ${width / 2} 0 0 1 ${width} 0V640M${right} 640`}
          />
        );
      })}
      <circle className="art-glow" cx="200" cy="470" r="24" fill="var(--accent)" stroke="none" />
    </g>
  );
}

/** People moving slowly around one child: the adults who protect them. */
function Circle() {
  const rings = [
    { radius: 88, dots: 5, spin: "art-spin-a" },
    { radius: 142, dots: 8, spin: "art-spin-b" },
    { radius: 192, dots: 11, spin: "art-spin-a" },
  ];
  return (
    <g>
      {rings.map(({ radius, dots, spin }) => (
        <g key={radius} className={spin}>
          <circle
            cx="200"
            cy="320"
            r={radius}
            fill="none"
            stroke="var(--art-line)"
            strokeWidth="2"
          />
          {Array.from({ length: dots }, (_, i) => {
            const angle = (i / dots) * Math.PI * 2;
            return (
              <circle
                key={i}
                cx={200 + Math.cos(angle) * radius}
                cy={320 + Math.sin(angle) * radius}
                r="9"
                fill="#ffffff"
              />
            );
          })}
        </g>
      ))}
      <circle className="art-glow" cx="200" cy="320" r="26" fill="var(--accent)" />
    </g>
  );
}

/** Lines of light travel in from all sides to one place of help. */
function Routes() {
  const starts = [
    [30, 60],
    [370, 40],
    [20, 300],
    [380, 280],
    [40, 590],
    [360, 600],
  ];
  return (
    <g fill="none">
      {starts.map(([x, y], i) => (
        <g key={i}>
          <path d={`M${x} ${y}Q${x} 320 200 320`} stroke="var(--art-line)" strokeWidth="4" />
          <path
            className="art-travel"
            style={delay(i * -420)}
            d={`M${x} ${y}Q${x} 320 200 320`}
            stroke="#ffffff"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx={x} cy={y} r="11" fill="#ffffff" />
        </g>
      ))}
      <circle className="art-glow" cx="200" cy="320" r="30" fill="var(--accent)" />
    </g>
  );
}

/** Threads pass over and under each other, like a strong cloth being woven. */
function Weave() {
  return (
    <g>
      {[60, 140, 220, 300, 380].map((x) => (
        <rect key={x} x={x - 13} y="0" width="26" height="640" fill="var(--art-line)" />
      ))}
      {[70, 170, 270, 370, 470, 570].map((y, i) => (
        <rect
          key={y}
          className={i % 2 ? "art-thread-b" : "art-thread-a"}
          x="-40"
          y={y - 9}
          width="480"
          height="18"
          fill={i === 2 ? "var(--accent)" : "#9aa3dd"}
        />
      ))}
    </g>
  );
}

/** Adire squares light up in a slow wave across the cloth. */
function Cloth() {
  const motifs = [
    <g key="rings">
      <circle cx="66" cy="66" r="46" />
      <circle cx="66" cy="66" r="28" />
      <circle cx="66" cy="66" r="10" />
    </g>,
    <path key="lines" d="M16 28h100M16 54h100M16 80h100M16 106h100" />,
    <g key="diamond">
      <path d="M66 12l54 54-54 54-54-54z" />
      <path d="M66 40l26 26-26 26-26-26z" />
    </g>,
    <path
      key="zigzag"
      d="M12 46l18-20 18 20 18-20 18 20 18-20 18 20M12 100l18-20 18 20 18-20 18 20 18-20 18 20"
    />,
  ];
  return (
    <g fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
      {Array.from({ length: 15 }, (_, i) => {
        const column = i % 3;
        const row = Math.floor(i / 3);
        return (
          <g
            key={i}
            className="art-fade"
            style={delay((row + column) * 500)}
            transform={`translate(${column * 134} ${row * 134})`}
          >
            {motifs[(row * 3 + column) % motifs.length]}
          </g>
        );
      })}
    </g>
  );
}

const ART = { doorway: Doorway, circle: Circle, routes: Routes, weave: Weave, cloth: Cloth };

/** A slow moving picture for the empty side of a page on larger screens. */
export function SideArt({ variant }: { variant: ArtVariant }) {
  const Art = ART[variant];
  return (
    <div
      aria-hidden
      data-art={variant}
      className="sticky top-32 hidden h-[calc(100vh-10rem)] max-h-[40rem] min-h-96 overflow-hidden rounded-lg bg-primary lg:block"
    >
      <svg viewBox="0 0 400 640" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
        <Art />
      </svg>
    </div>
  );
}
