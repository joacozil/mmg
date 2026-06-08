import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface HeroSectionProps {
  heroSrc: string;
  leftSrc: string;
  rightSrc: string;
}

export default function HeroSection({ heroSrc, leftSrc, rightSrc }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const galleryWrapperRef = useRef<HTMLDivElement>(null);
  const galleryContainerRef = useRef<HTMLDivElement>(null);
  const mainImageRef = useRef<HTMLDivElement>(null);
  const leftImageRef = useRef<HTMLDivElement>(null);
  const rightImageRef = useRef<HTMLDivElement>(null);
  const textContentRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Make sure ScrollTrigger is registered and we're on the client
    if (typeof window === 'undefined') return;

    const headerEl = document.querySelector('.main-header') as HTMLElement | null;
    const mainImg = mainImageRef.current?.querySelector('img');

    // Detect if the user has reloaded the page while scrolled past the hero.
    // If so, skip the entrance animation entirely to avoid the flash & layout jump.
    const heroBottom = galleryWrapperRef.current?.getBoundingClientRect().bottom ?? Infinity;
    const isScrolledPastHero = heroBottom <= 0;

    // ---------- Helper: create the scroll-scrub timeline ----------
    const createScrollTimeline = () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: galleryWrapperRef.current,
          pin: true,
          start: 'top top',
          end: '+=150%',
          scrub: 1,
          onLeave: () => {
            document.querySelector('.main-header')?.classList.add('is-sticky');
          },
          onEnterBack: () => {
            document.querySelector('.main-header')?.classList.remove('is-sticky');
          }
        }
      });

      // 1. Header slides up out of view
      tl.to(headerEl, { yPercent: -100, opacity: 0, duration: 0.5, ease: 'power1.inOut' }, 0);

      // 2. Text overlay fades out and moves slightly up
      tl.to(textContentRef.current, { opacity: 0, y: -30, duration: 0.8, ease: 'power2.inOut' }, 0);

      // 3. Middle image shrinks
      tl.to(mainImageRef.current, { width: '56%', height: '80%', duration: 1.5, ease: 'power2.inOut' }, 0);

      // 4. Add gap to gallery container
      tl.to(galleryContainerRef.current, { gap: '1.5rem', duration: 1.5, ease: 'power2.inOut' }, 0);

      // 5. Left and Right images slide in and expand
      tl.to(leftImageRef.current, { width: '22%', opacity: 1, xPercent: 0, duration: 1.5, ease: 'power2.inOut' }, 0.2);
      tl.to(rightImageRef.current, { width: '22%', opacity: 1, xPercent: 0, duration: 1.5, ease: 'power2.inOut' }, 0.2);
    };

    // =====================================================================
    // PATH A: Already scrolled past the hero – skip entrance, go straight
    //         to the sticky header and scroll timeline.
    // =====================================================================
    if (isScrolledPastHero) {
      // Header should be sticky immediately – no animation, no flash
      headerEl?.classList.add('is-sticky');

      // Hero elements can stay at their natural / final state (no need to
      // animate them since they are off-screen). Set side images to their
      // initial scroll positions so the scroll timeline math is correct.
      gsap.set(leftImageRef.current, { xPercent: -50 });
      gsap.set(rightImageRef.current, { xPercent: 50 });

      createScrollTimeline();

      // Restore exact scroll position from sessionStorage.
      // The saved value comes from a page that already had the pin spacer,
      // and we just recreated the pin spacer above, so the position is exact.
      try {
        const saved = parseInt(sessionStorage.getItem('__mmg_scrollY') || '0', 10);
        if (saved > 0) {
          // Force GSAP to finish all internal position calculations first
          ScrollTrigger.refresh();
          window.scrollTo(0, saved);

          // Fallback: GSAP may schedule deferred recalculations that overwrite
          // our scrollTo. Catch those by re-applying in the next frame.
          requestAnimationFrame(() => {
            window.scrollTo(0, saved);
            sessionStorage.removeItem('__mmg_scrollY');
          });
        }
      } catch(e) { /* ignore */ }
      return;
    }

    // =====================================================================
    // PATH B: At the top of the page – run the full entrance animation
    // =====================================================================

    // 1. Set initial hidden states immediately to avoid Flash of Unstyled Content (FOUC)
    gsap.set(headerEl, { y: -100, opacity: 0 });
    gsap.set(mainImageRef.current, { y: 30, opacity: 0 });
    if (mainImg) {
      gsap.set(mainImg, { scale: 1.1 });
    }
    gsap.set('.hero-subtitle', { y: 30, opacity: 0 });
    gsap.set('.hero-title', { y: 40, opacity: 0 });
    gsap.set('.hero-btn', { y: 30, opacity: 0 });

    // Set initial states for side images that scroll in later
    gsap.set(leftImageRef.current, { xPercent: -50 });
    gsap.set(rightImageRef.current, { xPercent: 50 });

    // 2. Coordinated Entrance Timeline
    const entranceTl = gsap.timeline({
      defaults: { ease: 'power3.out', duration: 1.2 }
    });

    entranceTl
      // A. Smooth slide-up and fade-in of main image + zoom out
      .to(mainImageRef.current, { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out' })
      .to(mainImg || [], { scale: 1, duration: 1.4, ease: 'power3.out' }, 0)

      // B. Slide down the header in sync
      .to(headerEl, { y: 0, opacity: 1, duration: 1.0, ease: 'power3.out' }, 0.4)

      // C. Stagger text content elements
      .to('.hero-subtitle', { y: 0, opacity: 1, duration: 0.8 }, 0.6)
      .to('.hero-title', { y: 0, opacity: 1, duration: 0.8 }, 0.7)
      .to('.hero-btn', { y: 0, opacity: 1, duration: 0.8 }, 0.8);

    // 3. Instantiate scroll timeline only after entrance animation has finished
    entranceTl.eventCallback('onComplete', () => {
      // Clear properties so ScrollTrigger has clean baseline values to animate
      gsap.set([mainImageRef.current, headerEl, '.hero-subtitle', '.hero-title', '.hero-btn'], { clearProps: 'all' });
      if (mainImg) {
        gsap.set(mainImg, { clearProps: 'all' });
      }

      // Re-initialize scroll-trigger target starting states
      gsap.set(leftImageRef.current, { xPercent: -50 });
      gsap.set(rightImageRef.current, { xPercent: 50 });

      createScrollTimeline();
    });

    // Clear any saved scroll – we're at the top doing the entrance animation
    try { sessionStorage.removeItem('__mmg_scrollY'); } catch(e) { /* ignore */ }

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Main Gallery Area (Pinned) */}
      <div ref={galleryWrapperRef} className="gradient-bg relative w-full h-screen overflow-hidden flex flex-col p-4 md:p-6 lg:p-8 z-10">
        <div className="gradient-bg__canvas" aria-hidden="true"></div>
        <div ref={galleryContainerRef} className="relative z-10 flex items-center justify-center w-full h-full max-w-[1400px] mx-auto mt-8 md:mt-12">

          {/* Left Side Image */}
          <div ref={leftImageRef} className="w-0 opacity-0 h-[80%] rounded-2xl overflow-hidden relative shrink-0 flex-none shadow-2xl">
            <img src={leftSrc} alt="Team generating ideas" className="absolute inset-0 w-full h-full object-cover" />
          </div>

          {/* Middle Main Image */}
          <div ref={mainImageRef} className="w-full h-full rounded-2xl overflow-hidden relative shrink-0 shadow-2xl">
            <img src={heroSrc} alt="Main Hero" className="absolute inset-0 w-full h-full object-cover" />

            {/* Subtle gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

            {/* Text Content overlay */}
            <div ref={textContentRef} className="absolute bottom-8 left-8 right-8 md:bottom-16 md:left-16 md:right-16 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
              <div className="max-w-2xl">
                <span className="hero-subtitle font-light text-white!">Desde Panamá hacia el mundo</span>
                <h1 className="hero-title font-bold text-white mt-4 border-b border-white pb-6">
                  Soluciones globales para clientes ambiciosos.
                </h1>
              </div>
              <a href="#contact" className="hero-btn bg-cream text-black px-8 py-3 rounded-full text-btn uppercase hover:bg-white transition-colors whitespace-nowrap">
                Contactanos
              </a>
            </div>
          </div>

          {/* Right Side Image */}
          <div ref={rightImageRef} className="w-0 opacity-0 h-[80%] rounded-2xl overflow-hidden relative shrink-0 flex-none shadow-2xl">
            <img src={rightSrc} alt="Building texture" className="absolute inset-0 w-full h-full object-cover" />
          </div>

        </div>
      </div>
    </div>
  );
}
