import { useEffect, useRef, useState, lazy, Suspense } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { img, texture, allArtists, profileUrl, type Credit } from "./images";
import BuildStage from "./BuildStage";
import "./App.css";
import "./build.css";

gsap.registerPlugin(ScrollTrigger);

// three + r3f are the heaviest thing here, so they stay out of the initial
// bundle and load only when their section is approached.
const Jellyfish = lazy(() => import("./Jellyfish"));

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

const promises = [
  { t: "CUSTOM, ALWAYS", d: "No templates and no page-builders. Every site is designed and coded from a blank page." },
  { t: "FAST BY DEFAULT", d: "Optimised bundles, real accessibility, Core Web Vitals in the green. Speed is a feature." },
  { t: "MOTION WITH MEANING", d: "Animation that guides the eye and earns the word premium, never decoration for its own sake." },
  { t: "ONE PAIR OF HANDS", d: "Design and build, front to back. Nothing lost in translation between a designer and a dev." },
];

function Ornament() {
  return <span className="at-orn" aria-hidden><i /><b /><i /></span>;
}

function Bridge({ tall }: { tall?: boolean }) {
  return <span className={`at-bridge${tall ? " is-tall" : ""}`} aria-hidden />;
}

function ShotCredit({ c }: { c: Credit }) {
  return (
    <a className="at-shot-credit" href={profileUrl(c)} target="_blank" rel="noreferrer noopener">
      {c.photographer}
    </a>
  );
}

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

/** Mounts its child only while near the viewport — a live WebGL context must
 *  not exist while it is scrolled away. */
function WhenNear({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: "400px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div className={className} ref={ref}>{near && children}</div>;
}

/**
 * Pointer position as two root vars in viewport pixels. Ported from the CV
 * project's spotlight cards: because the gradients paint in viewport space,
 * one rAF-coalesced pair of vars lights every card with no per-card listeners.
 */
function usePointerVars() {
  useEffect(() => {
    if (!matchMedia("(hover: hover)").matches) return;
    const root = document.documentElement;
    let raf = 0, x = 0, y = 0;
    const onMove = (e: PointerEvent) => {
      x = e.clientX; y = e.clientY;
      if (!raf) raf = requestAnimationFrame(() => {
        raf = 0;
        root.style.setProperty("--sx", String(x));
        root.style.setProperty("--sy", String(y));
      });
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

/**
 * Lenis smooth scroll, driven from GSAP's ticker.
 *
 * Two separate rAF loops (Lenis's own and GSAP's) would tear against each
 * other during a scrub, so Lenis is stepped from GSAP's ticker and
 * ScrollTrigger is told to update on Lenis's scroll event. Lag smoothing is
 * disabled because it re-times animations after a slow frame, which shows up
 * as a jump in a scrubbed timeline.
 */
function useSmoothScroll() {
  useEffect(() => {
    if (reduced()) return;
    const lenis = new Lenis({ duration: 1.05, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, []);
}

function Hero({ mail }: { mail: (s: string) => string }) {
  const [i, setI] = useState(1);
  const tier = tiers[i];
  const go = (d: number) => setI((p) => (p + d + tiers.length) % tiers.length);

  return (
    <section className="at-hero">
      <div className="at-hero-bg" aria-hidden>
        <img src={`${BASE}/work/silk-bg.webp`} alt="" data-hero-bg />
      </div>

      <div className="at-panel" data-panel>
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
      <span className="at-scroll-hint" aria-hidden>
        <span className="at-meta">SCROLL TO BUILD</span>
        <i />
      </span>
    </section>
  );
}

export default function App() {
  usePointerVars();
  useSmoothScroll();

  useEffect(() => {
    let cancelled = false;
    const isReduced = reduced();

    const ctx = gsap.context(() => {
      if (isReduced) return;
      // rAF does not fire in a hidden tab, so a .from() would set opacity 0
      // and never animate off it, leaving the hero invisible until focus.
      if (document.visibilityState === "hidden") return;

      gsap.timeline({ defaults: { ease: "power3.out" } })
        .from("[data-panel]", { y: 40, opacity: 0, duration: 1 })
        .from(".at-ltr", { yPercent: 115, opacity: 0, duration: 0.85, stagger: 0.04 }, "-=0.6")
        .from(".at-model, .at-panel-body .at-orn", { opacity: 0, y: 12, duration: 0.65 }, "-=0.45")
        .from(".at-triad article", { opacity: 0, y: 18, duration: 0.7, stagger: 0.08 }, "-=0.4")
        .from(".at-switch-item", { opacity: 0, y: 12, duration: 0.55, stagger: 0.06 }, "-=0.45")
        .from(".at-scroll-hint", { opacity: 0, y: -10, duration: 0.6 }, "-=0.3");

      gsap.to("[data-hero-bg]", {
        yPercent: 12, ease: "none",
        scrollTrigger: { trigger: ".at-hero", start: "top top", end: "bottom top", scrub: true },
      });

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.from(el, {
          y: 40, opacity: 0, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%" },
        });
      });
      gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach((el) => {
        gsap.from(el.children, {
          y: 28, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.09,
          scrollTrigger: { trigger: el, start: "top 85%" },
        });
      });
      gsap.utils.toArray<HTMLElement>(".at-h2, .at-bd-h, .at-final-h").forEach((el) => {
        gsap.from(el, {
          clipPath: "inset(0 0 100% 0)", y: 22, duration: 1.05, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%" },
        });
      });
      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        const f = Number(el.dataset.parallax) || 0.1;
        gsap.fromTo(el, { yPercent: -f * 100 }, {
          yPercent: f * 100, ease: "none",
          scrollTrigger: {
            trigger: el.closest("section")!, start: "top bottom", end: "bottom top", scrub: true,
          },
        });
      });
    });

    const counters = Array.from(document.querySelectorAll<HTMLElement>("[data-count]"));
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
    <div className="atelier-page">
      <span className="at-rule" aria-hidden />

      <main>
        <Hero mail={mail} />
        <Bridge tall />

        {/* THE ARGUMENT — the site builds itself in front of you */}
        <BuildStage />

        <Bridge tall />

        {/* MOTION — where the jellyfish finally earns its place: it is the
            demonstration of the claim the build stage just made about motion. */}
        <section className="at-bd-sec" id="at-motion">
          <Backdrop shot={img.monolith} tex={texture.willow} texOpacity={0.24} tone="is-lift" />
          <WhenNear className="at-jelly">
            <Suspense fallback={null}><Jellyfish loop={20} /></Suspense>
          </WhenNear>
          <div className="at-bd-inner at-center">
            <p className="at-label" data-reveal>PROOF — MOTION</p>
            <h2 className="at-bd-h" data-reveal>NOTHING<br />HERE IS STOCK</h2>
            <p className="at-lede at-center-lede" data-reveal>
              This creature is not a video or a model file. It is geometry and
              two shaders, written by hand and running live in your browser —
              the same tools that make an interface feel considered rather than
              assembled.
            </p>
          </div>
        </section>

        <Bridge tall />

        {/* SURFACES — art direction */}
        <section className="at-bd-sec at-short" id="at-surfaces">
          <Backdrop shot={img.chrome} tex={texture.stone} texOpacity={0.12} />
          <div className="at-bd-inner at-center">
            <p className="at-label" data-reveal>DIRECTION</p>
            <h2 className="at-bd-h" data-reveal>A LOOK, NOT A THEME</h2>
            <p className="at-lede at-center-lede" data-reveal>
              Type, spacing and restraint carry the work. Colour arrives last and
              does the least.
            </p>
          </div>
        </section>

        <Bridge tall />

        {/* PROMISE */}
        <section className="at-bd-sec" id="at-promise">
          <Backdrop shot={img.glass} tex={texture.ink} texOpacity={0.14} />
          <div className="at-bd-inner">
            <p className="at-label" data-reveal>THE PROMISE</p>
            <h2 className="at-bd-h" data-reveal>WHY WORK<br />WITH ME</h2>
            <div className="at-grid at-grid-4" data-stagger>
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

        {/* STATS — honest ones */}
        <section className="at-bd-sec at-short" id="at-stats">
          <Backdrop shot={img.car} tex={texture.streaks} texOpacity={0.14} />
          <div className="at-bd-inner">
            <div className="at-stats">
              <div className="at-stat at-pane">
                <strong><span data-count="0">0</span></strong>
                <span className="at-meta">TEMPLATES USED</span>
              </div>
              <div className="at-stat at-pane">
                <strong><span data-count="100">0</span>%</strong>
                <span className="at-meta">WRITTEN BY HAND</span>
              </div>
              <div className="at-stat at-pane">
                <strong><span data-count="1">0</span></strong>
                <span className="at-meta">PAIR OF HANDS</span>
              </div>
              <div className="at-stat at-pane">
                <strong>&infin;</strong>
                <span className="at-meta">REVISIONS UNTIL RIGHT</span>
              </div>
            </div>
          </div>
        </section>

        <Bridge tall />

        {/* THE ADMISSION — the honest version, which is stronger than a fake
            portfolio and is the whole reason the build stage exists. */}
        <section className="at-bd-sec" id="at-honest">
          <Backdrop shot={img.ocean} tex={texture.stone} texOpacity={0.14} />
          <div className="at-bd-inner">
            <p className="at-label" data-reveal>PLAINLY</p>
            <h2 className="at-bd-h" data-reveal>NO CLIENT LIST<br />YET</h2>
            <p className="at-lede" data-reveal>
              I am not going to show you someone else&rsquo;s work with my name
              under it, or invent logos for a wall. What I can show you is this
              site — every line of it written from an empty file, and every
              choice in it deliberate enough that I am happy to walk you through
              why.
            </p>
            <p className="at-lede" data-reveal>
              If that is the standard you want applied to yours, that is the
              whole pitch.
            </p>
          </div>
        </section>

        <Bridge tall />

        {/* CLOSE */}
        <section className="at-bd-sec at-close" id="at-close">
          <Backdrop shot={img.clouds} tex={texture.marble} texOpacity={0.1} />
          <div className="at-final at-pane" data-reveal>
            <p className="at-label">COMMISSION</p>
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
