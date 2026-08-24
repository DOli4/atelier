import { useEffect, useRef, useState, lazy, Suspense, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { img, texture, allArtists, profileUrl, type Credit } from "./images";
import "./App.css";

// Code-split: three + r3f are the heaviest thing on the page, so they are
// not in the initial bundle and only load when the section is approached.
const Jellyfish = lazy(() => import("./Jellyfish"));

gsap.registerPlugin(ScrollTrigger);

const EMAIL = "Oli4Dieter@gmail.com";
const BASE = "/atelier";
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const tiers = [
  {
    id: "essential", label: "ESSENTIAL", model: "THE ONE-PAGER",
    cols: [
      { h: "PERFORMANCE", d: "One sharp page, tuned to load fast and convert. Nothing on it that isn't earning its place." },
      { h: "CLARITY", d: "A single story, told once and told well. Your offer readable inside five seconds." },
      { h: "CRAFT", d: "Hand-coded from an empty file. No builder, no template, no theme to fight later." },
    ],
  },
  {
    id: "signature", label: "SIGNATURE", model: "THE FULL SITE",
    cols: [
      { h: "PRESENCE", d: "Many pages, one voice. A structure that still reads as deliberate at the twentieth screen." },
      { h: "MOTION", d: "Considered animation that guides the eye and earns the word premium, never decoration." },
      { h: "ENDURANCE", d: "React and TypeScript underneath, so the thing you launch is the thing you can grow." },
    ],
  },
  {
    id: "bespoke", label: "BESPOKE", model: "ANYTHING YOU IMAGINE",
    cols: [
      { h: "AMBITION", d: "The brief nobody else wanted to quote on. Bring the difficult one and we start there." },
      { h: "SYSTEMS", d: "Real products with real data behind them. Interfaces engineered, not merely decorated." },
      { h: "PARTNERSHIP", d: "Design and build from one pair of hands. Nothing is lost between a designer and a dev." },
    ],
  },
];

const process = [
  { k: "01", t: "THE BRIEF", d: "We talk. I learn your goal, your audience, and exactly what winning looks like." },
  { k: "02", t: "THE SKETCH", d: "A distinctive direction, then high-fidelity screens you can feel, not merely approve." },
  { k: "03", t: "THE BUILD", d: "Pixel-accurate, accessible, fast front-end. The design shipped exactly as drawn." },
  { k: "04", t: "THE REVEAL", d: "Launched, tuned and handed over, documented well enough to grow on." },
];

const promises = [
  { t: "CUSTOM, ALWAYS", d: "No templates and no page-builders. Every site is designed and coded from a blank page." },
  { t: "FAST BY DEFAULT", d: "Optimised bundles, real accessibility, Core Web Vitals in the green. Speed is a feature." },
  { t: "MOTION WITH MEANING", d: "Animation that guides the eye and earns the word premium, never decoration for its own sake." },
  { t: "ONE PAIR OF HANDS", d: "Design and build, front to back. Nothing lost in translation between a designer and a dev." },
];

const ORBIT_WORDS = ["DESIGN", "BUILD", "SHIP", "SCALE", "ENDURE"];


/**
 * Mounts its child only while the element is near the viewport.
 *
 * The jellyfish holds a live WebGL context and runs shaders every frame, so it
 * must not exist while it is scrolled away. `rootMargin` starts the chunk
 * download slightly before it is needed so it is ready on arrival.
 */
function WhenNear({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => setNear(e.isIntersecting),
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div className={className} ref={ref}>{near && children}</div>;
}


/**
 * Pointer position as two root-level vars in viewport pixels.
 *
 * Ported from the CV project's drill dashboard. Because the card gradients use
 * background-attachment: fixed (viewport space), ONE pair of vars lights up
 * every card at once — no per-card listeners. Writes are rAF-coalesced so
 * there is a single style recalc per frame rather than one per event, and it
 * is mouse-only: on touch the glow would just freeze wherever you last tapped.
 */
function usePointerVars() {
  useEffect(() => {
    if (!matchMedia("(hover: hover)").matches) return;
    const root = document.documentElement;
    let raf = 0, x = 0, y = 0;
    const onMove = (e: PointerEvent) => {
      x = e.clientX; y = e.clientY;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0;
          root.style.setProperty("--sx", String(x));
          root.style.setProperty("--sy", String(y));
        });
      }
    };
    addEventListener("pointermove", onMove, { passive: true });
    return () => {
      removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
      root.style.removeProperty("--sx");
      root.style.removeProperty("--sy");
    };
  }, []);
}

function Ornament() {
  return <span className="at-orn" aria-hidden><i /><b /><i /></span>;
}

/**
 * The gap between two image sections.
 *
 * There is deliberately no colour matching here. Each section's backdrop is
 * masked to fade out at its own top and bottom edges, so both sides of this
 * gap are literally the page ground — a seam cannot appear. An earlier
 * revision hand-maintained a table of sampled edge colours and grew a visible
 * hard line the moment a filter or overlay alpha changed.
 */
function Bridge({ tall }: { tall?: boolean }) {
  return <span className={`at-bridge${tall ? " is-tall" : ""}`} aria-hidden />;
}

/** Small gold photographer mark sitting on an image, linking to their profile. */
function ShotCredit({ c }: { c: Credit }) {
  return (
    <a className="at-shot-credit" href={profileUrl(c)} target="_blank" rel="noreferrer noopener">
      {c.photographer}
    </a>
  );
}

/**
 * A full-bleed image background for a section.
 *
 * The image is a plain <img> with only cheap paint-time filters — no runtime
 * blur, no blend mode. `tex` lays one texture over it at low opacity so the
 * surface reads as a material. Kept deliberately lean: this markup repeats
 * once per section, so anything expensive here multiplies across the page.
 */
function Backdrop({ shot, tex, texOpacity = 0.1, tone = "" }:
  { shot: Credit; tex?: Credit; texOpacity?: number; tone?: string }) {
  return (
    <>
      <div className={`at-bd ${tone}`} aria-hidden>
        <img src={shot.src} alt="" data-parallax="0.1" />
        {tex && <span className="at-bd-tex" style={{
          backgroundImage: `url(${tex.src})`, opacity: texOpacity }} />}
      </div>
      <ShotCredit c={shot} />
    </>
  );
}

function SplitWord({ text, className }: { text: string; className: string }) {
  return (
    <span className={className} aria-label={text}>
      {text.split("").map((ch, i) => <span className="at-ltr" key={i} aria-hidden>{ch}</span>)}
    </span>
  );
}


/**
 * FOUR MOVES as a pinned horizontal run.
 *
 * The section pins while the four cards travel sideways, so downward scrolling
 * reads as moving along the process rather than down a list — and the
 * jellyfish stays hanging at centre while they sweep past it.
 *
 * The page is a position:fixed scroll container, so ScrollTrigger has to be
 * pointed at that element rather than the window. Narrow screens and
 * reduced-motion fall back to a native snap strip: pinning a horizontal run
 * fights the vertical scroll gesture on touch.
 */
function HorizontalMoves({ scrollerRef }: { scrollerRef: RefObject<HTMLDivElement | null> }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [native, setNative] = useState(false);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const wrap = wrapRef.current;
    const track = trackRef.current;
    if (reduced() || window.innerWidth < 900 || !scroller || !wrap || !track) {
      setNative(true);
      return;
    }
    const ctx = gsap.context(() => {
      const distance = () => Math.max(0, track.scrollWidth - wrap.clientWidth);

      // The horizontal run itself. Held in a variable because each card's own
      // trigger needs it as `containerAnimation` — that is what lets a trigger
      // resolve positions along a horizontally-moving track instead of against
      // the vertical scroll.
      const run = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: wrap, start: "center center", end: () => `+=${distance() + 200}`,
          scrub: 0.7, pin: true, scroller, invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });

      // Each card resolves as it travels into the middle of the frame.
      gsap.utils.toArray<HTMLElement>(".at-move").forEach((card) => {
        gsap.fromTo(card,
          { opacity: 0.3, scale: 0.9, rotateY: 14 },
          {
            opacity: 1, scale: 1, rotateY: 0, ease: "power2.out",
            scrollTrigger: {
              trigger: card, containerAnimation: run,
              start: "left 90%", end: "left 50%", scrub: true,
            },
          });
      });
    });
    return () => ctx.revert();
  }, [scrollerRef]);

  return (
    <div className={`at-hmoves${native ? " is-native" : ""}`} ref={wrapRef}>
      <div className="at-htrack" ref={trackRef}>
        {process.map((s) => (
          <article className="at-move at-pane" key={s.k}>
            <span className="at-cell-k">{s.k}</span>
            <h3 className="at-cell-t">{s.t}</h3>
            <p className="at-cell-d">{s.d}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function Hero({ mail }: { mail: (s: string) => string }) {
  const [i, setI] = useState(1);
  const tier = tiers[i];
  const go = (d: number) => setI((p) => (p + d + tiers.length) % tiers.length);

  return (
    <section className="at-hero">
      {/* Pre-blurred 520px asset stretched by CSS — the softness is baked into
          the file, so there is no per-frame blur() on a full-viewport image. */}
      <div className="at-hero-bg" aria-hidden>
        <img src={`${BASE}/work/silk-bg.webp`} alt="" data-hero-bg />
      </div>

      <div className="at-panel at-glass" data-panel>
        <header className="at-panel-top">
          <div className="at-panel-lead">
            <span className="at-menu" aria-hidden><i /><i /><i /></span>
            <span className="at-brand">
              <strong>ATELIER</strong>
              <em>DIETER OLIVIER</em>
            </span>
          </div>
          <span className="at-crest" aria-hidden />
          <a className="at-panel-link" href={mail("Website commission")}>COMMISSION</a>
        </header>

        <button className="at-edge at-edge-l" onClick={() => go(-1)} aria-label="Previous tier">
          <ChevronLeft className="size-4" aria-hidden />
        </button>
        <button className="at-edge at-edge-r" onClick={() => go(1)} aria-label="Next tier">
          <ChevronRight className="size-4" aria-hidden />
        </button>

        <div className="at-panel-body">
          <h1 className="at-wordmark-wrap"><SplitWord text="ATELIER" className="at-wordmark" /></h1>
          <p className="at-model" key={tier.id}>{tier.model}</p>
          <Ornament />
          <div className="at-triad" key={`${tier.id}-cols`}>
            {tier.cols.map((c) => (
              <article key={c.h}><h2>{c.h}</h2><p>{c.d}</p></article>
            ))}
          </div>
        </div>

        <div className="at-switch">
          <button className="at-switch-arrow" onClick={() => go(-1)} aria-label="Previous tier">
            <ChevronLeft className="size-3.5" aria-hidden />
          </button>
          <div className="at-switch-items">
            {tiers.map((t, k) => (
              <button key={t.id} className={`at-switch-item${k === i ? " is-on" : ""}`}
                onClick={() => setI(k)} aria-current={k === i}>
                <span>ATELIER</span><strong>{t.label}</strong>
              </button>
            ))}
          </div>
          <button className="at-switch-arrow" onClick={() => go(1)} aria-label="Next tier">
            <ChevronRight className="size-3.5" aria-hidden />
          </button>
        </div>
      </div>

      <ShotCredit c={img.silk} />
    </section>
  );
}

export default function App() {
  const root = useRef<HTMLDivElement>(null);
  usePointerVars();

  useEffect(() => {
    const scroller = root.current;
    if (!scroller) return;
    let cancelled = false;
    const isReduced = reduced();

    const ctx = gsap.context(() => {
      if (isReduced) return;

      // GSAP's ticker is requestAnimationFrame-driven, and rAF does not fire in a
      // background tab. A .from() sets its start state immediately, so opening the
      // site in an unfocused tab would otherwise leave the hero pinned at opacity 0
      // — invisible until the tab is focused. Skip the entrance in that case and
      // let the content stand at its natural state.
      if (document.visibilityState === "hidden") return;

      gsap.timeline({ defaults: { ease: "power3.out" } })
        .from("[data-panel]", { y: 40, opacity: 0, duration: 1 })
        .from(".at-ltr", { yPercent: 115, opacity: 0, duration: 0.85, stagger: 0.04 }, "-=0.6")
        .from(".at-model, .at-panel-body .at-orn", { opacity: 0, y: 12, duration: 0.65 }, "-=0.45")
        .from(".at-triad article", { opacity: 0, y: 18, duration: 0.7, stagger: 0.08 }, "-=0.4")
        .from(".at-switch-item", { opacity: 0, y: 12, duration: 0.55, stagger: 0.06 }, "-=0.45");

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.from(el, {
          y: 40, opacity: 0, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", scroller },
        });
      });
      gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach((el) => {
        gsap.from(el.children, {
          y: 28, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.09,
          scrollTrigger: { trigger: el, start: "top 85%", scroller },
        });
      });
      gsap.utils.toArray<HTMLElement>(".at-h2, .at-bd-h, .at-final-h").forEach((el) => {
        gsap.from(el, {
          clipPath: "inset(0 0 100% 0)", y: 22, duration: 1.05, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", scroller },
        });
      });

      // Parallax only the section background images. Transform-only, so it
      // stays on the compositor and never triggers layout or paint.
      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        const f = Number(el.dataset.parallax) || 0.1;
        gsap.fromTo(el, { yPercent: -f * 100 }, {
          yPercent: f * 100, ease: "none",
          scrollTrigger: {
            trigger: el.closest("section")!, start: "top bottom", end: "bottom top",
            scrub: true, scroller,
          },
        });
      });
    }, root);

    const counters = Array.from(scroller.querySelectorAll<HTMLElement>("[data-count]"));
    let io: IntersectionObserver | null = null;
    if (isReduced) {
      counters.forEach((el) => { el.textContent = String(el.dataset.count); });
    } else {
      io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          io?.unobserve(el);
          const to = Number(el.dataset.count);
          const t0 = performance.now();
          const tick = (now: number) => {
            if (cancelled) return;
            const p = Math.min(1, (now - t0) / 1200);
            el.textContent = String(Math.round(to * (1 - Math.pow(1 - p, 3))));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });
      }, { threshold: 0.6 });
      counters.forEach((el) => io?.observe(el));
    }

    return () => { cancelled = true; ctx.revert(); io?.disconnect(); };
  }, []);

  useEffect(() => {
    if (reduced()) return;
    const btns = Array.from(document.querySelectorAll<HTMLElement>(".at-cta"));
    const cleanups = btns.map((b) => {
      const setX = gsap.quickTo(b, "x", { duration: 0.5, ease: "power3.out" });
      const setY = gsap.quickTo(b, "y", { duration: 0.5, ease: "power3.out" });
      const move = (e: PointerEvent) => {
        const r = b.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        if (Math.hypot(dx, dy) < 150) { setX(dx * 0.26); setY(dy * 0.34); }
        else { setX(0); setY(0); }
      };
      window.addEventListener("pointermove", move);
      return () => window.removeEventListener("pointermove", move);
    });
    return () => cleanups.forEach((fn) => fn());
  }, []);

  const mail = (s: string) => `mailto:${EMAIL}?subject=${encodeURIComponent(s)}`;

  return (
    <div className="atelier-page" ref={root}>
      <span className="at-rule" aria-hidden />

      <main>
        <Hero mail={mail} />
        <Bridge tall />

        {/* 01 — SURFACES, carried by the chrome frame */}
        <section className="at-bd-sec" id="at-surfaces">
          <Backdrop shot={img.chrome} tex={texture.stone} texOpacity={0.12} />
          <div className="at-bd-inner at-center">
            <p className="at-label" data-reveal>01 — SELECTED SURFACES</p>
            <h2 className="at-bd-h" data-reveal>SHAPED<br />BY HAND</h2>
            <p className="at-lede at-center-lede" data-reveal>
              No templates and no page-builders. Every surface is drawn, coded and
              tuned from an empty file.
            </p>
          </div>
        </section>

        <Bridge tall />

        {/* 02 — MONOLITH, with the orbiting word ring */}
        <section className="at-bd-sec at-mono" id="at-mono">
          <Backdrop shot={img.monolith} tex={texture.willow} texOpacity={0.26} tone="is-lift" />
          <div className="at-orbit" aria-hidden>
            <div className="at-orbit-stage">
              {ORBIT_WORDS.map((w, i) => (
                <span className="at-orbit-word" key={w} style={{
                  ["--seat" as string]: `${(i * 360) / ORBIT_WORDS.length}deg`,
                  ["--delay" as string]:
                    `${(-18 * ((ORBIT_WORDS.length - i) % ORBIT_WORDS.length)) / ORBIT_WORDS.length - 9}s`,
                }}>{w}</span>
              ))}
            </div>
          </div>

          <div className="at-slab at-glass" data-reveal>
            <div className="at-slab-top">
              <span className="at-meta">ATELIER</span><span className="at-meta">/ 02</span>
            </div>
            <h2 className="at-slab-h">STILL<br />BUILDING</h2>
            <p className="at-slab-sub">
              Every surface here was drawn, coded and tuned by one person. The work is
              quiet on purpose — it should hold up on the tenth visit, not only the first.
            </p>
            <div className="at-slab-rows">
              {[["DISCIPLINE", "DESIGN + CODE"], ["STACK", "REACT / TYPESCRIPT"],
                ["TEMPLATES", "NONE"], ["AVAILABILITY", "OPEN"]].map(([k, v]) => (
                <div className="at-slab-row" key={k}>
                  <span className="at-meta">{k}</span><strong>{v}</strong>
                </div>
              ))}
            </div>
            <a className="at-cta at-cta-sm" href={mail("Website commission")}>START A COMMISSION</a>
          </div>
        </section>

        <Bridge tall />

        {/* 03 — PROCESS, carried by the refracted-glass frame */}
        <section className="at-bd-sec" id="at-process">
          <Backdrop shot={img.glass} tex={texture.concrete} texOpacity={0.12} />

          <WhenNear className="at-jelly">
            <Suspense fallback={null}>
              <Jellyfish loop={20} />
            </Suspense>
          </WhenNear>

          <div className="at-bd-inner">
            <p className="at-label" data-reveal>03 — HOW IT WORKS</p>
            <h2 className="at-bd-h" data-reveal>FOUR MOVES</h2>
            <HorizontalMoves scrollerRef={root} />
          </div>
        </section>

        <Bridge tall />

        {/* 04 — STATEMENT, carried by the ocean */}
        <section className="at-bd-sec" id="at-work">
          <Backdrop shot={img.ocean} tex={texture.stone} texOpacity={0.14} />
          <div className="at-bd-inner">
            <p className="at-label" data-reveal>04 — SELECTED WORK</p>
            <h2 className="at-bd-h" data-reveal>CALM<br />UNDER LOAD</h2>
            <p className="at-lede" data-reveal>
              Smooth when the traffic surges. Optimised, accessible, and engineered to
              hold its nerve under pressure.
            </p>
          </div>
        </section>

        <Bridge tall />

        {/* 05 — PROMISE, carried by the sculptural form */}
        <section className="at-bd-sec" id="at-promise">
          <Backdrop shot={img.form} tex={texture.ink} texOpacity={0.16} />
          <div className="at-bd-inner">
            <p className="at-label" data-reveal>05 — THE PROMISE</p>
            <h2 className="at-bd-h" data-reveal>WHY WORK<br />WITH ME</h2>
            <div className="at-grid at-grid-4 at-glass" data-stagger>
              {promises.map((p) => (
                <article className="at-cell at-pane" key={p.t}>
                  <h3 className="at-cell-t">{p.t}</h3>
                  <p className="at-cell-d">{p.d}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <Bridge tall />

        {/* 06 — STATS, carried by the car frame */}
        <section className="at-bd-sec at-short" id="at-stats">
          <Backdrop shot={img.car} tex={texture.streaks} texOpacity={0.14} />
          <div className="at-bd-inner">
            <div className="at-stats at-glass" data-reveal>
              <div className="at-stat at-pane">
                <strong><span data-count="22">0</span></strong>
                <span className="at-meta">DISTINCTIONS EARNED</span>
              </div>
              <div className="at-stat at-pane">
                <strong><span data-count="100">0</span>%</strong>
                <span className="at-meta">CUSTOM-CODED</span>
              </div>
              <div className="at-stat at-pane">
                <strong><span data-count="0">0</span></strong>
                <span className="at-meta">TEMPLATES USED</span>
              </div>
              <div className="at-stat at-pane">
                <strong>&infin;</strong>
                <span className="at-meta">REVISIONS UNTIL RIGHT</span>
              </div>
            </div>
          </div>
        </section>

        <Bridge tall />

        {/* 07 — CLOSE, carried by the cloudbank */}
        <section className="at-bd-sec at-close" id="at-close">
          <Backdrop shot={img.clouds} tex={texture.marble} texOpacity={0.1} />
          <div className="at-final at-glass" data-reveal>
            <p className="at-label">07 — COMMISSION</p>
            <h2 className="at-final-h">READY TO BUILD</h2>
            <Ornament />
            <p className="at-lede">
              Tell me what you want to build. I will turn it into a website worth
              bookmarking.
            </p>
            <a className="at-cta" href={mail("Let's build my website")}>START A COMMISSION</a>
          </div>
        </section>

        <footer className="at-foot">
          <p className="at-foot-credits">
            <span className="at-meta">PHOTOGRAPHY</span>
            <span className="at-foot-names">
              {allArtists.map((a, i) => (
                <span key={a.handle}>
                  <a href={`https://unsplash.com/@${a.handle}`} target="_blank" rel="noreferrer noopener">
                    {a.photographer}
                  </a>
                  {i < allArtists.length - 1 && <i aria-hidden> · </i>}
                </span>
              ))}
            </span>
            <span className="at-meta at-foot-licence">
              All images via{" "}
              <a href="https://unsplash.com" target="_blank" rel="noreferrer noopener">Unsplash</a>,
              used under the{" "}
              <a href="https://unsplash.com/license" target="_blank" rel="noreferrer noopener">Unsplash Licence</a>
              {" "}— free to use, not public domain. Copyright stays with the photographers.
            </span>
          </p>
          <div className="at-foot-base">
            <span className="at-meta">© {new Date().getFullYear()} DIETER OLIVIER</span>
            <a className="at-meta" href="https://doli4.github.io/" target="_blank" rel="noreferrer noopener">
              PERSONAL PORTFOLIO
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
