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

    let cleanupScrollListener: (() => void) | undefined;
    const mm = gsap.matchMedia();

    // =====================================================================
    // DESKTOP: width >= 1024px
    // =====================================================================
    mm.add("(min-width: 1024px)", () => {
      let scrollTl: gsap.core.Timeline;

      const createScrollTimeline = () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: galleryWrapperRef.current,
            pin: true,
            start: 'top top',
            end: '+=150%',
            scrub: 1,
            onLeave: () => {
              headerEl?.classList.add('is-sticky');
            },
            onEnterBack: () => {
              headerEl?.classList.remove('is-sticky');
            }
          }
        });

        // Text overlay fades out and moves slightly up
        tl.to(textContentRef.current, { opacity: 0, y: -30, duration: 0.8, ease: 'power2.inOut' }, 0);

        // Middle image shrinks
        tl.to(mainImageRef.current, { width: '56%', height: '80%', duration: 1.5, ease: 'power2.inOut' }, 0);

        // Add gap to gallery container
        tl.to(galleryContainerRef.current, { gap: '1.5rem', duration: 1.5, ease: 'power2.inOut' }, 0);

        // Left and Right images slide in and expand
        tl.to(leftImageRef.current, { width: '22%', opacity: 1, xPercent: 0, duration: 1.5, ease: 'power2.inOut' }, 0.2);
        tl.to(rightImageRef.current, { width: '22%', opacity: 1, xPercent: 0, duration: 1.5, ease: 'power2.inOut' }, 0.2);

        // Signal that the hero scroll trigger has been initialized
        (window as any).heroScrollTriggerInitialized = true;
        window.dispatchEvent(new CustomEvent('hero-scroll-trigger-init'));

        return tl;
      };

      if (isScrolledPastHero) {
        headerEl?.classList.add('is-sticky');
        gsap.set(leftImageRef.current, { xPercent: -50 });
        gsap.set(rightImageRef.current, { xPercent: 50 });

        createScrollTimeline();

        try {
          const saved = parseInt(sessionStorage.getItem('__mmg_scrollY') || '0', 10);
          if (saved > 0) {
            ScrollTrigger.refresh();
            window.scrollTo(0, saved);
            requestAnimationFrame(() => {
              window.scrollTo(0, saved);
              sessionStorage.removeItem('__mmg_scrollY');
            });
          }
        } catch (e) { /* ignore */ }
        return;
      }

      scrollTl = createScrollTimeline();
      if (scrollTl.scrollTrigger) {
        scrollTl.scrollTrigger.disable(false);
      }

      // Set initial hidden states
      gsap.set(headerEl, { y: -100, opacity: 0 });
      gsap.set(mainImageRef.current, { y: 30, opacity: 0 });
      if (mainImg) {
        gsap.set(mainImg, { scale: 1.1 });
      }
      gsap.set('.hero-subtitle', { y: 30, opacity: 0 });
      gsap.set('.hero-title', { y: 40, opacity: 0 });
      gsap.set('.hero-btn', { y: 30, opacity: 0 });

      gsap.set(leftImageRef.current, { xPercent: -50 });
      gsap.set(rightImageRef.current, { xPercent: 50 });

      const entranceTl = gsap.timeline({
        defaults: { ease: 'power3.out', duration: 1.2 }
      });

      const handleScroll = () => {
        if (window.scrollY > 0) {
          if (cleanupScrollListener) cleanupScrollListener();
          if (entranceTl.isActive()) {
            entranceTl.progress(1);
          }
        }
      };
      window.addEventListener('scroll', handleScroll);
      cleanupScrollListener = () => {
        window.removeEventListener('scroll', handleScroll);
      };

      entranceTl
        .to(mainImageRef.current, { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out' })
        .to(mainImg || [], { scale: 1, duration: 1.4, ease: 'power3.out' }, 0)
        .to(headerEl, { y: 0, opacity: 1, duration: 1.0, ease: 'power3.out' }, 0.4)
        .to('.hero-subtitle', { y: 0, opacity: 1, duration: 0.8 }, 0.6)
        .to('.hero-title', { y: 0, opacity: 1, duration: 0.8 }, 0.7)
        .to('.hero-btn', { y: 0, opacity: 1, duration: 0.8 }, 0.8);

      entranceTl.eventCallback('onComplete', () => {
        if (cleanupScrollListener) {
          cleanupScrollListener();
          cleanupScrollListener = undefined;
        }

        gsap.set([mainImageRef.current, headerEl, '.hero-subtitle', '.hero-title', '.hero-btn'], { clearProps: 'all' });
        if (mainImg) {
          gsap.set(mainImg, { clearProps: 'all' });
        }

        gsap.set(leftImageRef.current, { xPercent: -50 });
        gsap.set(rightImageRef.current, { xPercent: 50 });

        if (scrollTl.scrollTrigger) {
          scrollTl.scrollTrigger.enable();
          scrollTl.scrollTrigger.refresh();
        }
      });
    });

    // =====================================================================
    // TABLET & MOBILE: width < 1024px
    // =====================================================================
    mm.add("(max-width: 1023px)", () => {
      let stickyTrigger: ScrollTrigger;

      const createMobileScrollTrigger = () => {
        return ScrollTrigger.create({
          trigger: galleryWrapperRef.current,
          start: 'top+=80px top',
          onEnter: () => {
            headerEl?.classList.add('is-sticky');
          },
          onLeaveBack: () => {
            headerEl?.classList.remove('is-sticky');
          }
        });
      };

      if (isScrolledPastHero) {
        headerEl?.classList.add('is-sticky');
        (window as any).heroScrollTriggerInitialized = true;
        window.dispatchEvent(new CustomEvent('hero-scroll-trigger-init'));
        createMobileScrollTrigger();
        return;
      }

      stickyTrigger = createMobileScrollTrigger();
      stickyTrigger.disable(false);

      // Set initial hidden states
      gsap.set(headerEl, { y: -100, opacity: 0 });
      gsap.set(mainImageRef.current, { y: 30, opacity: 0 });
      if (mainImg) {
        gsap.set(mainImg, { scale: 1.1 });
      }
      gsap.set('.hero-subtitle', { y: 30, opacity: 0 });
      gsap.set('.hero-title', { y: 40, opacity: 0 });
      gsap.set('.hero-btn', { y: 30, opacity: 0 });

      const entranceTl = gsap.timeline({
        defaults: { ease: 'power3.out', duration: 1.2 }
      });

      const handleScroll = () => {
        if (window.scrollY > 0) {
          if (cleanupScrollListener) cleanupScrollListener();
          if (entranceTl.isActive()) {
            entranceTl.progress(1);
          }
        }
      };
      window.addEventListener('scroll', handleScroll);
      cleanupScrollListener = () => {
        window.removeEventListener('scroll', handleScroll);
      };

      entranceTl
        .to(mainImageRef.current, { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out' })
        .to(mainImg || [], { scale: 1, duration: 1.4, ease: 'power3.out' }, 0)
        .to(headerEl, { y: 0, opacity: 1, duration: 1.0, ease: 'power3.out' }, 0.4)
        .to('.hero-subtitle', { y: 0, opacity: 1, duration: 0.8 }, 0.6)
        .to('.hero-title', { y: 0, opacity: 1, duration: 0.8 }, 0.7)
        .to('.hero-btn', { y: 0, opacity: 1, duration: 0.8 }, 0.8);

      entranceTl.eventCallback('onComplete', () => {
        if (cleanupScrollListener) {
          cleanupScrollListener();
          cleanupScrollListener = undefined;
        }

        gsap.set([mainImageRef.current, headerEl, '.hero-subtitle', '.hero-title', '.hero-btn'], { clearProps: 'all' });
        if (mainImg) {
          gsap.set(mainImg, { clearProps: 'all' });
        }

        (window as any).heroScrollTriggerInitialized = true;
        window.dispatchEvent(new CustomEvent('hero-scroll-trigger-init'));

        stickyTrigger.enable();
        stickyTrigger.refresh();
      });
    });

    try { sessionStorage.removeItem('__mmg_scrollY'); } catch (e) { /* ignore */ }

    return () => {
      if (cleanupScrollListener) {
        cleanupScrollListener();
      }
      mm.revert();
    };
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Main Gallery Area (Pinned) */}
      <div ref={galleryWrapperRef} className="gradient-bg relative w-full h-screen overflow-hidden flex flex-col pt-16 pb-6 px-4 md:pt-16 md:pb-8 md:px-6 lg:p-8 z-10">
        <div className="gradient-bg__canvas" aria-hidden="true"></div>
        <div ref={galleryContainerRef} className="relative z-10 flex items-center justify-center w-full h-full max-w-[1400px] mx-auto mt-0 lg:mt-12">

          {/* Left Side Image */}
          <div ref={leftImageRef} className="w-0 opacity-0 h-[80%] rounded-2xl overflow-hidden relative shrink-0 flex-none shadow-2xl">
            <img src={leftSrc} alt="Team generating ideas" className="absolute inset-0 w-full h-full object-cover" />
          </div>

          {/* Middle Main Image */}
          <div ref={mainImageRef} className="w-full h-full rounded-2xl overflow-hidden relative shrink-0 shadow-2xl">
            <img src={heroSrc} alt="Main Hero" className="absolute inset-0 w-full h-full object-cover" />

            {/* Subtle gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-linear-to-t from-black/85 via-transparent to-black/60 lg:from-black/80 lg:via-black/20 lg:to-transparent"></div>

            {/* Text Content overlay */}
            <div ref={textContentRef} className="absolute inset-8 md:inset-12 lg:inset-auto lg:bottom-16 lg:left-16 lg:right-16 flex flex-col justify-between lg:flex-row lg:items-end lg:justify-between gap-6 lg:gap-8">
              <div className="max-w-2xl">
                <span className="hero-subtitle font-light text-white! block">Desde Panamá hacia el mundo</span>
                <h1 className="hero-title font-bold text-white mt-3 lg:mt-4 lg:border-b lg:border-white lg:pb-6">
                  Soluciones globales para clientes ambiciosos.
                </h1>
              </div>
              <div className="w-full lg:w-auto flex flex-col lg:flex-row items-stretch lg:items-end gap-6">
                <div className="w-full h-px bg-white/30 lg:hidden"></div>
                <a href="#contact" className="hero-btn bg-cream text-black px-8 py-3 rounded-full text-btn uppercase hover:bg-white transition-colors text-center whitespace-nowrap self-start lg:self-auto">
                  Contactanos
                </a>
              </div>
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
