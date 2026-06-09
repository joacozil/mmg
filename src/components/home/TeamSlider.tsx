import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

interface TeamMember {
  name: string;
  role: string;
  imageSrc: string;
}

interface Props {
  teamMembers: TeamMember[];
}

export default function TeamSlider({ teamMembers }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const track = trackRef.current;
    const section = document.getElementById('team-section');
    if (!track || !section) return;

    let ctxScrollTrigger: ScrollTrigger | null = null;
    let isDestroyed = false;

    const getDimensions = () => {
      const containerEl = document.querySelector('#team-section .container-custom');
      if (!containerEl) return { C: 0 };

      const computedStyle = window.getComputedStyle(containerEl);
      const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
      const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
      const C = containerEl.clientWidth - paddingLeft - paddingRight;
      return { C };
    };

    const setupSlider = () => {
      if (isDestroyed) return;

      // Kill previous ScrollTrigger instance if exists
      if (ctxScrollTrigger) {
        ctxScrollTrigger.kill();
        ctxScrollTrigger = null;
      }

      // Reset track position before measuring
      gsap.set(track, { x: 0 });

      const { C } = getDimensions();
      const S = track.scrollWidth;

      // Safe check: if container or track has not fully initialized (width is 0),
      // defer setup until next frame to avoid division by zero or translating everything off-screen.
      if (C <= 0 || S <= 0) {
        requestAnimationFrame(setupSlider);
        return;
      }

      const amountToScroll = S - C;

      if (amountToScroll <= 0) {
        // If everything fits, just leave it natively left-aligned inside container-custom
        gsap.set(track, { x: 0 });
        return;
      }

      // Create the scroll animation
      const anim = gsap.to(track, {
        x: -amountToScroll,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          pin: true,
          scrub: 1,
          start: () => {
            const headerEl = document.querySelector('.main-header');
            const headerHeight = headerEl ? headerEl.getBoundingClientRect().height : 0;
            return `top top+=${headerHeight}`;
          },
          end: () => `+=${amountToScroll}`,
          invalidateOnRefresh: true,
          onRefresh: (self) => {
            const dims = getDimensions();
            const trackWidth = track.scrollWidth;
            const scrollAmt = trackWidth - dims.C;

            if (dims.C > 0 && trackWidth > 0 && scrollAmt > 0) {
              self.vars.end = `+=${scrollAmt}`;
            } else {
              self.kill();
              gsap.set(track, { x: 0 });
            }
          }
        }
      });

      // Save scroll trigger instance
      ctxScrollTrigger = anim.scrollTrigger || null;
    };

    // Initialize slider track and bind load/images triggers
    const initSlider = () => {
      // 1. Initial calculation
      setupSlider();

      // 2. Global images listener: other sections loading their images shifts our coordinates.
      // Refresh ScrollTrigger and recalibrate calculations when any image on the page completes loading.
      const allImgs = document.querySelectorAll('img');
      const onImageStateChange = () => {
        setupSlider();
        ScrollTrigger.refresh();
      };

      allImgs.forEach((img) => {
        if (!img.complete) {
          img.addEventListener('load', onImageStateChange);
          img.addEventListener('error', onImageStateChange);
        }
      });

      return () => {
        allImgs.forEach((img) => {
          img.removeEventListener('load', onImageStateChange);
          img.removeEventListener('error', onImageStateChange);
        });
      };
    };

    // Clean up image listeners returned by initSlider
    const cleanUpImageListeners = initSlider();

    const onResize = () => {
      setupSlider();
    };

    const onLoad = () => {
      setupSlider();
      ScrollTrigger.refresh();
    };

    window.addEventListener('resize', onResize);

    // If document is already complete, run refresh immediately
    if (document.readyState === 'complete') {
      onLoad();
    } else {
      window.addEventListener('load', onLoad);
    }

    return () => {
      isDestroyed = true;
      window.removeEventListener('resize', onResize);
      window.removeEventListener('load', onLoad);
      cleanUpImageListeners();
      if (ctxScrollTrigger) {
        ctxScrollTrigger.kill();
      }
    };
  }, { scope: containerRef, dependencies: [teamMembers] });

  return (
    <div ref={containerRef} className="w-full overflow-hidden relative z-20">
      <div className="container-custom" style={{ overflow: 'visible' }}>
        <div
          ref={trackRef}
          className="flex gap-6 lg:gap-8 w-max items-stretch pb-16"
        >
          {teamMembers.map((member, idx) => (
            <div key={idx} className="w-[220px] sm:w-[260px] lg:w-[300px] shrink-0 flex flex-col gap-4">
              <div className="w-full aspect-square overflow-hidden rounded-md bg-light-green">
                <img
                  src={member.imageSrc}
                  alt={member.name}
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="flex flex-col justify-center">
                <span className="block text-p-small! uppercase text-gray-500">
                  {member.role}
                </span>
                <span className="block font-bold text-p-large! mt-1 text-primary">
                  {member.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
