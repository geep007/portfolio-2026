/* ---------------------------------------------------------------------------
   Motion runtime.

   One rAF loop drives everything: Lenis smooth scroll, then any scrubbed
   elements. Reveals ride on IntersectionObserver so they cost nothing per
   frame. Geometry is cached and only re-measured on resize, so the scroll
   handler never reads layout.

   Everything degrades to "no motion, content visible" under
   prefers-reduced-motion.
--------------------------------------------------------------------------- */

import Lenis from "lenis";

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

/* --------------------------------------------------------------- reveals -- */

function initReveals() {
  const items = document.querySelectorAll<HTMLElement>("[data-reveal]");

  if (reduced.matches) {
    items.forEach((el) => el.classList.add("is-in"));
    return;
  }

  // Stagger siblings inside a [data-stagger] group so a row of cards arrives
  // as a sequence rather than a block.
  document
    .querySelectorAll<HTMLElement>("[data-stagger]")
    .forEach((group) => {
      const step = Number(group.dataset.stagger) || 80;
      group
        .querySelectorAll<HTMLElement>(":scope > [data-reveal]")
        .forEach((child, i) => {
          child.style.setProperty("--reveal-delay", `${i * step}ms`);
        });
    });

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-in");
        // Entrances play once. Re-triggering on every pass is noise.
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -6% 0px", threshold: 0.01 },
  );

  items.forEach((el) => observer.observe(el));
}

/* ------------------------------------------------------------ hero intro -- */

function initHeroIntro() {
  const hero = document.querySelector<HTMLElement>("[data-hero]");
  if (!hero) return;

  if (reduced.matches) {
    hero.classList.add("is-in");
    return;
  }

  // Wait for the display face so the masked lines don't reveal a fallback
  // first and reflow mid-animation.
  const start = () =>
    requestAnimationFrame(() => hero.classList.add("is-in"));

  if (document.fonts?.ready) {
    document.fonts.ready.then(start);
    // Never let a slow font block the entrance entirely.
    setTimeout(start, 900);
  } else {
    start();
  }
}

/* -------------------------------------------------------------- scrubbing -- */

type Scrubbed = {
  el: HTMLElement;
  /** How far the element travels before it is fully "in", in px. */
  start: number;
  end: number;
  last: number;
};

function initScrub(lenis: Lenis | null) {
  const els = Array.from(
    document.querySelectorAll<HTMLElement>("[data-scrub]"),
  );
  if (!els.length) return () => {};

  if (reduced.matches) {
    els.forEach((el) => el.style.setProperty("--p", "1"));
    return () => {};
  }

  let tracked: Scrubbed[] = [];

  const measure = () => {
    const vh = window.innerHeight;
    const scrollY = window.scrollY;
    tracked = els.map((el) => {
      const rect = el.getBoundingClientRect();
      const top = rect.top + scrollY;
      const mode = el.dataset.scrub;
      // "enter"  — 0 when the top edge hits the bottom of the viewport,
      //            1 once the element is a third of the way up.
      // "through"— 0 to 1 across the element's own travel past the viewport.
      const start = mode === "through" ? top - vh : top - vh;
      const end =
        mode === "through" ? top + rect.height : top - vh * 0.35;
      return { el, start, end: Math.max(end, start + 1), last: -1 };
    });
  };

  const update = (scrollY: number) => {
    for (const item of tracked) {
      const raw = (scrollY - item.start) / (item.end - item.start);
      const p = raw < 0 ? 0 : raw > 1 ? 1 : raw;
      // Skip the style write when the value hasn't meaningfully moved —
      // custom property writes invalidate style on the subtree.
      if (Math.abs(p - item.last) < 0.001) continue;
      item.last = p;
      item.el.style.setProperty("--p", p.toFixed(4));
    }
  };

  measure();
  update(window.scrollY);

  let resizeTimer: number | undefined;
  window.addEventListener(
    "resize",
    () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        measure();
        update(lenis ? lenis.scroll : window.scrollY);
      }, 150);
    },
    { passive: true },
  );

  return update;
}

/* ------------------------------------------------------------------- nav -- */

function initNav() {
  const nav = document.querySelector<HTMLElement>("[data-nav]");
  if (!nav) return () => {};

  let lastY = window.scrollY;
  const threshold = 40;

  return (y: number) => {
    nav.classList.toggle("is-stuck", y > threshold);

    // Hide on the way down, bring it back the moment they scroll up — the
    // nav is only in the way while they're reading forward.
    const delta = y - lastY;
    if (Math.abs(delta) > 4) {
      nav.classList.toggle("is-hidden", delta > 0 && y > 200);
      lastY = y;
    }
  };
}

/* ----------------------------------------------------------------- video -- */

function initVideo() {
  const videos = document.querySelectorAll<HTMLVideoElement>("[data-autoplay]");
  if (!videos.length) return;

  // Looping video off-screen is wasted decode work and battery.
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const video = entry.target as HTMLVideoElement;
        if (entry.isIntersecting) {
          video.play().catch(() => {
            /* autoplay refused — the poster stands in */
          });
        } else {
          video.pause();
        }
      }
    },
    { threshold: 0.1 },
  );

  videos.forEach((video) => {
    if (reduced.matches) {
      // Reduced motion gets a still frame and an explicit control, never a
      // looping clip.
      video.removeAttribute("autoplay");
      video.controls = true;
      video.pause();
      return;
    }
    observer.observe(video);
  });
}

/* --------------------------------------------------------------- anchors -- */

function initAnchors(lenis: Lenis | null) {
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (event) => {
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector<HTMLElement>(id);
      if (!target) return;
      event.preventDefault();
      if (lenis) {
        lenis.scrollTo(target, { offset: -80, duration: 1.1 });
      } else {
        target.scrollIntoView({ behavior: "auto", block: "start" });
      }
    });
  });
}

/* ------------------------------------------------------------------ boot -- */

function boot() {
  let lenis: Lenis | null = null;

  if (!reduced.matches) {
    lenis = new Lenis({
      // Slightly long, weighty glide — editorial, not springy.
      lerp: 0.085,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      // Native momentum on touch already feels right; hijacking it doesn't.
      syncTouch: false,
    });
  }

  const onScrub = initScrub(lenis);
  const onNav = initNav();

  const onScroll = (y: number) => {
    onScrub(y);
    onNav(y);
  };

  if (lenis) {
    lenis.on("scroll", ({ scroll }: { scroll: number }) => onScroll(scroll));

    const raf = (time: number) => {
      lenis!.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  } else {
    let ticking = false;
    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          onScroll(window.scrollY);
          ticking = false;
        });
      },
      { passive: true },
    );
  }

  onScroll(window.scrollY);
  initReveals();
  initHeroIntro();
  initVideo();
  initAnchors(lenis);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
