import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface WorldMapProps {
  /** Raw markup of the dotted base map (imported with `?raw`). */
  mapSvg: string;
  title: string;
  text: string;
}

/* ── Map coordinate space matches the base SVG viewBox: 1684 × 819 ── */

// Caribbean hubs — each marker on the map is an origin of expansion arcs.
const PANAMA = { x: 421, y: 422 };
const BAHAMAS = { x: 445, y: 359 };
const PUERTO_RICO = { x: 494, y: 399 };

// An arc destination. Set `curvature` to override the default bow for that
// single line (larger = deeper arc; the bow direction stays poleward).
type Arc = { name: string; x: number; y: number; curvature?: number };

// Expansion arcs from each hub toward the dense (high-presence) regions.
const expansions: Arc[] = [
  { name: "Norteamérica", x: 380, y: 270, curvature: -0.4 },
  { name: "Europa", x: 980, y: 230 },
  { name: "África", x: 935, y: 500, curvature: -0.4 },
  { name: "Suramérica", x: 550, y: 615, curvature: -0.4 },
];

const bahamasArcs: Arc[] = [
  { name: "Bahamas-1", x: 300, y: 150, curvature: -0.4 },
  { name: "Bahamas-2", x: 1280, y: 160 },
  { name: "Bahamas-3", x: 600, y: 580, curvature: -0.4 },
];

const puertoRicoArcs: Arc[] = [
  { name: "PuertoRico-1", x: 1150, y: 150 },
  { name: "PuertoRico-2", x: 1300, y: 330 },
  { name: "PuertoRico-3", x: 850, y: 370 },
];

// Each arc group: an origin point and its destination arcs.
const arcGroups = [
  { from: PANAMA, arcs: expansions },
  { from: BAHAMAS, arcs: bahamasArcs },
  { from: PUERTO_RICO, arcs: puertoRicoArcs },
] as const;

// Default bow strength; any arc can override it via its `curvature` field.
const ARC_CURVATURE = 0.4;

/** Quadratic-bezier arc between two points. Every arc bows toward the top of
 *  the map (poleward); `curvature` controls how deep the bow is. */
function arcPath(
  from: { x: number; y: number },
  to: { x: number; y: number },
  curvature: number = ARC_CURVATURE,
) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.hypot(dx, dy) || 1;
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  // Perpendicular to the chord, always pointing "up" (negative y) so every
  // arc is concave toward the top — no per-arc sign tuning needed.
  let nx = -dy / dist;
  let ny = dx / dist;
  if (ny > 0) {
    nx = -nx;
    ny = -ny;
  }
  const cx = mx + nx * dist * curvature;
  const cy = my + ny * dist * curvature;
  return `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`;
}

// Flattened list of every arc's resolved path data + its destination point.
const ARC_PATHS = arcGroups.flatMap(({ from, arcs }) =>
  arcs.map((a) => ({
    name: a.name,
    d: arcPath(from, a, a.curvature),
    x: a.x,
    y: a.y,
  })),
);

// Side length of the destination marker squares (viewBox units).
const MARKER_SIZE = 14;

// Looping tracer timing.
const TRACE_OPACITY = 0.9; // peak brightness of the moving highlight
const DRAW_DUR = 1.8; // seconds — slow, smooth draw
const FADE_DUR = 0.9; // seconds — soft return to the base state
const TRACE_GAP = 0.3; // seconds between consecutive lines

export default function WorldMap({ mapSvg, title, text }: WorldMapProps) {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (typeof window === "undefined") return;
      const root = rootRef.current;
      if (!root) return;

      const header = root.querySelector<HTMLElement>(".wm-header");
      const overlay = root.querySelector<SVGElement>(".wm-overlay");
      const traces = Array.from(
        root.querySelectorAll<SVGPathElement>("[data-arc-trace]"),
      );

      // Each tracer starts fully "undrawn" and invisible; the base lines
      // underneath stay at their low CSS opacity at all times.
      traces.forEach((t) => {
        const len = t.getTotalLength();
        gsap.set(t, {
          strokeDasharray: len,
          strokeDashoffset: len,
          opacity: 0,
        });
      });

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reduced) {
        gsap.set([header, overlay], { opacity: 1, y: 0 });
        gsap.set(traces, { strokeDashoffset: 0, opacity: TRACE_OPACITY });
        return;
      }

      // Initial hidden states (avoid a flash of the finished map).
      gsap.set(header, { opacity: 0, y: 30 });
      gsap.set(overlay, { opacity: 0 });

      // Header reveal.
      ScrollTrigger.create({
        trigger: header,
        start: "top 70%",
        once: true,
        onEnter: () =>
          gsap.to(header, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
          }),
      });

      // Reveal the overlay, then loop a tracer that lights up one line at a
      // time: draw it slowly, then softly fade it back to the low-opacity base.
      ScrollTrigger.create({
        trigger: root.querySelector(".wm-svg"),
        start: "top 60%",
        once: true,
        onEnter: () => {
          gsap.to(overlay, { opacity: 1, duration: 0.6 });

          const loop = gsap.timeline({ repeat: -1, repeatDelay: 0.8 });
          traces.forEach((t) => {
            const len = t.getTotalLength();
            loop
              .set(t, { strokeDashoffset: len, opacity: 0 })
              .to(t, { opacity: TRACE_OPACITY, duration: 0.5, ease: "sine.in" })
              .to(
                t,
                { strokeDashoffset: 0, duration: DRAW_DUR, ease: "sine.inOut" },
                "<",
              )
              .to(
                t,
                { opacity: 0, duration: FADE_DUR, ease: "sine.out" },
                ">-0.1",
              )
              .to({}, { duration: TRACE_GAP });
          });
        },
      });

      ScrollTrigger.refresh();
    },
    { scope: rootRef },
  );

  return (
    <section
      ref={rootRef}
      data-map-section
      className="wm w-full bg-cream pt-section-gap pb-0 overflow-hidden"
    >
      {/* Header */}
      <div className="container-custom">
        <div className="wm-header grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 mb-12 lg:mb-16">
          <div className="lg:col-span-7 flex flex-col justify-start">
            <h2
              className="text-primary lg:max-w-[600px]"
              dangerouslySetInnerHTML={{ __html: title }}
            />
          </div>
          <div className="lg:col-span-5 flex items-start lg:justify-end w-full">
            <p
              className="lg:max-w-[400px] w-full"
              dangerouslySetInnerHTML={{ __html: text }}
            />
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="wm-wrapper">
        <div className="wm-zoom">
          <div className="wm-inner">
            {/* Base dotted map */}
            <div
              className="wm-svg"
              dangerouslySetInnerHTML={{ __html: mapSvg }}
            />

            {/* Overlay: expansion arcs from Panama */}
            <svg
              className="wm-overlay"
              viewBox="0 0 1684 819"
              preserveAspectRatio="xMidYMid meet"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Base lines — always present at low opacity */}
              {ARC_PATHS.map((a) => (
                <path key={`base-${a.name}`} className="wm-arc" d={a.d} />
              ))}
              {/* Tracer highlights — drawn one at a time, looping */}
              {ARC_PATHS.map((a) => (
                <path
                  key={`trace-${a.name}`}
                  data-arc-trace
                  className="wm-arc wm-arc-trace"
                  d={a.d}
                  style={{ opacity: 0 }}
                />
              ))}
              {/* Destination markers at the end of every line */}
              {ARC_PATHS.map((a) => (
                <rect
                  key={`dot-${a.name}`}
                  className="wm-arc-dot"
                  x={a.x - MARKER_SIZE / 2}
                  y={a.y - MARKER_SIZE / 2}
                  width={MARKER_SIZE}
                  height={MARKER_SIZE}
                />
              ))}
              {/* Hub markers (Panamá, Bahamas, Puerto Rico) — kept primary on
                  top of the grayscaled base map. */}
              {arcGroups.map(({ from }, i) => (
                <rect
                  key={`hub-${i}`}
                  className="wm-arc-dot"
                  x={from.x - MARKER_SIZE / 2}
                  y={from.y - MARKER_SIZE / 2}
                  width={MARKER_SIZE}
                  height={MARKER_SIZE}
                />
              ))}
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
