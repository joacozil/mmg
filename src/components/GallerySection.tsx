import React, { useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface Achievement {
  src: string;
  alt: string;
  year: string;
  description: string;
}

interface GallerySectionProps {
  title: string;
  subtitle?: string;
  achievements: Achievement[];
  /** How many cards are revealed before the "Ver todo" button. */
  initialCount?: number;
}

export default function GallerySection({
  title,
  subtitle,
  achievements,
  initialCount = 4,
}: GallerySectionProps) {
  const sectionRef = React.useRef<HTMLElement>(null);
  const [expanded, setExpanded] = useState(false);

  const hasMore = achievements.length > initialCount;
  const visible = expanded ? achievements : achievements.slice(0, initialCount);

  // Reveal each card as it enters the viewport. Re-runs when `expanded`
  // changes so newly mounted cards get their own trigger; the
  // `:not([data-revealed])` guard prevents re-animating cards already shown.
  useGSAP(
    () => {
      if (typeof window === "undefined") return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const cards = gsap.utils.toArray<HTMLElement>(
        "[data-gallery-card]:not([data-revealed])",
      );

      cards.forEach((card) => {
        card.dataset.revealed = "true";
        gsap.from(card, {
          opacity: 0,
          y: 48,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 88%",
          },
        });
      });

      ScrollTrigger.refresh();
    },
    { scope: sectionRef, dependencies: [expanded] },
  );

  return (
    <section
      ref={sectionRef}
      className="w-full bg-cream py-section-gap relative"
    >
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-start">
          {/* Left: sticky title + subtitle */}
          <div className="lg:sticky lg:top-32 lg:self-start">
            <h2 className="text-primary">{title}</h2>
            {subtitle && <p className="mt-6 max-w-md">{subtitle}</p>}
          </div>

          {/* Right: scrolling stack of achievement cards */}
          <div className="flex flex-col gap-16 lg:gap-24">
            {visible.map((item, i) => (
              <article key={i} data-gallery-card className="flex flex-col">
                <div className="w-full aspect-4/3 overflow-hidden shadow-md">
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="w-full h-full object-cover"
                  />
                </div>
                {item.year && <h4 className="mt-6">{item.year}</h4>}
                <p className="mt-2 text-p-large">{item.description}</p>
              </article>
            ))}

            {hasMore && !expanded && (
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="self-start inline-flex items-center gap-2 px-8 py-3 border border-darker-green text-darker-green text-btn uppercase transition-colors hover:bg-darker-green hover:text-cream cursor-pointer"
              >
                Ver todo
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
