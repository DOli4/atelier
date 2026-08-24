import { useEffect, useRef, useState, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./App.css";

gsap.registerPlugin(ScrollTrigger);

const EMAIL = "Oli4Dieter@gmail.com";
const BASE = "/atelier";

/**
 * Tiers drive the hero exactly the way the Aventador reference drives its
 * hero: the brand wordmark stays fixed, the *model* line and the three
 * feature columns swap when you move the switcher at the bottom.
 */
const tiers = [
  {
    id: "essential",
    label: "ESSENTIAL",
    model: "THE ONE-PAGER",
    cols: [
      { h: "PERFORMANCE", d: "One sharp page, tuned to load fast and convert. Nothing on it that isn't earning its place." },
      { h: "CLARITY", d: "A single story, told once and told well. Your offer readable inside five seconds." },
      { h: "CRAFT", d: "Hand-coded from an empty file. No builder, no template, no theme to fight later." },
    ],
  },
  {
    id: "signature",
    label: "SIGNATURE",
    model: "THE FULL SITE",
    cols: [
      { h: "PRESENCE", d: "Many pages, one voice. A structure that still reads as deliberate at the twentieth screen." },
      { h: "MOTION", d: "Considered animation that guides the eye and earns the word premium, never decoration." },
      { h: "ENDURANCE", d: "React and TypeScript underneath, so the thing you launch is the thing you can grow." },
    ],
  },
  {
    id: "bespoke",
    label: "BESPOKE",
    model: "ANYTHING YOU IMAGINE",
    cols: [
      { h: "AMBITION", d: "The brief nobody else wanted to quote on. Bring the difficult one and we start there." },
      { h: "SYSTEMS", d: "Real products with real data behind them. Interfaces engineered, not merely decorated." },
      { h: "PARTNERSHIP", d: "Design and build from one pair of hands. Nothing is lost between a designer and a dev." },
    ],
  },
];

const reel = [
  { img: `${BASE}/work/car.webp`, tag: "PERFORMANCE", name: "Built to last" },
  { img: `${BASE}/work/ocean.webp`, tag: "RESILIENCE", name: "Calm under load" },
  { img: `${BASE}/work/glass.webp`, tag: "CRAFT", name: "Shaped by hand" },
];

const process = [
  { k: "01", t: "THE BRIEF", d: "We talk. I learn your goal, your audience, and exactly what winning looks like." },
  { k: "02", t: "THE SKETCH", d: "A distinctive direction, then high-fidelity screens you can feel, not merely approve." },
  { k: "03", t: "THE BUILD", d: "Pixel-accurate, accessible, fast front-end. The design shipped exactly as drawn." },
  { k: "04", t: "THE REVEAL", d: "Launched, tuned and handed over, documented well enough to grow on." },
];

const bands = [
  { img: `${BASE}/work/car.webp`, eyebrow: "PERFORMANCE", h: "Fast, and built to last.",
    sub: "Optimised, accessible, and engineered to perform under pressure.", credit: "Cash Macanaya" },
  { img: `${BASE}/work/ocean.webp`, eyebrow: "RESILIENCE", h: "Calm under load.",
    sub: "Smooth when the traffic surges. Resilient by design.", credit: "Callum Mullin" },
  { img: `${BASE}/work/glass.webp`, eyebrow: "CRAFT", h: "Crafted, not assembled.",
    sub: "Shaped by hand, detail by detail. No templates, ever.", credit: "Resource Database" },
];

const promises = [
  { t: "CUSTOM, ALWAYS", d: "No templates and no page-builders. Every site is designed and coded from a blank page." },
  { t: "FAST BY DEFAULT", d: "Optimised bundles, real accessibility, Core Web Vitals in the green. Speed is a feature." },
  { t: "MOTION WITH MEANING", d: "Animation that guides the eye and earns the word premium, never decoration for its own sake." },
  { t: "ONE PAIR OF HANDS", d: "Design and build, front to back. Nothing lost in translation between a designer and a dev." },
];

/** The small centred divider mark that sits under the wordmark. */
function Ornament() {
  return (
    <span className="at-orn" aria-hidden>
      <i /><b /><i />
    </span>
  );
}

/** The hero: one frosted panel over a heavily blurred photograph, with a
 *  bottom switcher that swaps the model line and the three columns above. */
function Hero({ mail }: { mail: (s: string) => string }) {
  const [i, setI] = useState(1);
  const tier = tiers[i];
  const go = (d: number) => setI((p) => (p + d + tiers.length) % tiers.length);

  return (
    <section className="at-hero">
      <div className="at-hero-bg" aria-hidden>
        <img src={`${BASE}/work/car.webp`} alt="" />
      </div>

      <div className="at-panel">
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
          <h1 className="at-wordmark">ATELIER</h1>
          <p className="at-model" key={tier.id}>{tier.model}</p>

          <Ornament />

          <div className="at-triad" key={`${tier.id}-cols`}>
            {tier.cols.map((c) => (
              <article key={c.h}>
                <h2>{c.h}</h2>
                <p>{c.d}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="at-switch">
          <button className="at-switch-arrow" onClick={() => go(-1)} aria-label="Previous tier">
            <ChevronLeft className="size-3.5" aria-hidden />
          </button>
          <div className="at-switch-items">
            {tiers.map((t, k) => (
              <button
                key={t.id}
                className={`at-switch-item${k === i ? " is-on" : ""}`}
                onClick={() => setI(k)}
                aria-current={k === i}
              >
                <span>ATELIER</span>
                <strong>{t.label}</strong>
              </button>
            ))}
          </div>
          <button className="at-switch-arrow" onClick={() => go(1)} aria-label="Next tier">
            <ChevronRight className="size-3.5" aria-hidden />
          </button>
        </div>
      </div>
    </section>
  );
}

/** A single image stage you flip through, the words laid over the photo. */
function WorkShowcase() {
  const [i, setI] = useState(0);
  const cur = bands[i];
  const go = (d: number) => setI((p) => (p + d + bands.length) % bands.length);

  return (
    <div className="at-stage">
      <img className="at-stage-img" src={cur.img} alt="" aria-hidden key={cur.img} />
      <button className="at-edge at-edge-l" onClick={() => go(-1)} aria-label="Previous image">
        <ChevronLeft className="size-4" aria-hidden />
      </button>
      <button className="at-edge at-edge-r" onClick={() => go(1)} aria-label="Next image">
        <ChevronRight className="size-4" aria-hidden />
      </button>

      <div className="at-stage-mid" key={i}>
        <p className="at-label">{cur.eyebrow}</p>
        <h3 className="at-stage-h">{cur.h}</h3>
        <p className="at-stage-sub">{cur.sub}</p>
      </div>

      <div className="at-stage-foot">
        <span className="at-meta">PHOTOGRAPH — {cur.credit}</span>
        <div className="at-dots">
          {bands.map((_, k) => (
            <button
              key={k}
              className={k === i ? "is-on" : ""}
              onClick={() => setI(k)}
              aria-label={`Image ${k + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Pinned horizontal-scroll gallery. Desktop pins and drives the track
 *  sideways; small screens and reduced-motion get a native snap strip,
 *  since pinning fights the vertical scroll gesture on touch. */
function HorizontalReel({ scrollerRef }: { scrollerRef: RefObject<HTMLDivElement | null> }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [native, setNative] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const narrow = window.innerWidth < 860;
    const scroller = scrollerRef.current;
    if (reduce || narrow || !scroller || !wrapRef.current || !trackRef.current) {
      setNative(true);
      return;
    }
    const wrap = wrapRef.current;
    const track = trackRef.current;
    const ctx = gsap.context(() => {
      const distance = () => track.scrollWidth - wrap.clientWidth;
      gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: wrap,
          start: "top top",
          end: () => `+=${distance()}`,
          scrub: 0.6,
          pin: true,
          scroller,
          invalidateOnRefresh: true,
        },
      });
    });
    return () => ctx.revert();
  }, [scrollerRef]);

  return (
    <div className="at-reel-wrap" ref={wrapRef}>
      <div className={`at-reel${native ? " is-native" : ""}`}>
        <div className="at-reel-track" ref={trackRef}>
          {reel.map((r) => (
            <figure className="at-reel-card" key={r.name}>
              <img src={r.img} alt={r.name} loading="lazy" />
              <figcaption>
                <span className="at-label">{r.tag}</span>
                <strong>{r.name}</strong>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cancelled = false;

    // The page is a position:fixed scroll container, so ScrollTrigger has to
    // watch IT rather than the window, which never scrolls here.
    const scroller = root.current;
    const ctx = gsap.context(() => {
      if (reduce) return; // leave everything at rest, fully visible
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.from(el, {
          y: 36, opacity: 0, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 90%", scroller },
        });
      });
      gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach((el) => {
        gsap.from(el.children, {
          y: 28, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.1,
          scrollTrigger: { trigger: el, start: "top 85%", scroller },
        });
      });
    }, root);

    // Count-up for the stat numbers, once, when they scroll in.
    const counters = Array.from(root.current?.querySelectorAll<HTMLElement>("[data-count]") ?? []);
    let io: IntersectionObserver | null = null;
    if (reduce) {
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

  const mail = (subject: string) =>
    `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}`;

  return (
    <div className="atelier-page" ref={root}>
      {/* The single full-bleed gold hairline, the reference's one loud move */}
      <span className="at-rule" aria-hidden />

      <main>
        <Hero mail={mail} />

        {/* REEL */}
        <section id="at-reel" className="at-section">
          <header className="at-sec-head" data-reveal>
            <p className="at-label">01 — THE REEL</p>
            <h2 className="at-h2">SELECTED SURFACES</h2>
            <p className="at-lede">
              A few of the things I have shipped. Scroll down, then sideways.
            </p>
          </header>
          <HorizontalReel scrollerRef={root} />
        </section>

        {/* PROCESS */}
        <section id="at-process" className="at-section">
          <header className="at-sec-head" data-reveal>
            <p className="at-label">02 — HOW IT WORKS</p>
            <h2 className="at-h2">FOUR MOVES</h2>
            <p className="at-lede">No smoke, no mystery. You always know what happens next.</p>
          </header>
          <div className="at-grid at-grid-4" data-stagger>
            {process.map((s) => (
              <article className="at-cell" key={s.k}>
                <span className="at-cell-k">{s.k}</span>
                <h3 className="at-cell-t">{s.t}</h3>
                <p className="at-cell-d">{s.d}</p>
              </article>
            ))}
          </div>
        </section>

        {/* WORK */}
        <section id="at-work" className="at-section">
          <header className="at-sec-head" data-reveal>
            <p className="at-label">03 — SELECTED WORK</p>
            <h2 className="at-h2">A LOOK THAT READS AS EXPENSIVE</h2>
          </header>
          <div data-reveal>
            <WorkShowcase />
          </div>
        </section>

        {/* PROMISE */}
        <section id="at-promise" className="at-section">
          <header className="at-sec-head" data-reveal>
            <p className="at-label">04 — THE PROMISE</p>
            <h2 className="at-h2">WHY WORK WITH ME</h2>
          </header>
          <div className="at-grid at-grid-4" data-stagger>
            {promises.map((p) => (
              <article className="at-cell" key={p.t}>
                <h3 className="at-cell-t">{p.t}</h3>
                <p className="at-cell-d">{p.d}</p>
              </article>
            ))}
          </div>
        </section>

        {/* STATS */}
        <section className="at-section">
          <div className="at-stats" data-reveal>
            <div className="at-stat">
              <strong><span data-count="22">0</span></strong>
              <span className="at-meta">DISTINCTIONS EARNED</span>
            </div>
            <div className="at-stat">
              <strong><span data-count="100">0</span>%</strong>
              <span className="at-meta">CUSTOM-CODED</span>
            </div>
            <div className="at-stat">
              <strong><span data-count="0">0</span></strong>
              <span className="at-meta">TEMPLATES USED</span>
            </div>
            <div className="at-stat">
              <strong>&infin;</strong>
              <span className="at-meta">REVISIONS UNTIL RIGHT</span>
            </div>
          </div>
        </section>

        {/* FINAL */}
        <section className="at-section">
          <div className="at-final" data-reveal>
            <p className="at-label">05 — COMMISSION</p>
            <h2 className="at-final-h">READY TO BUILD</h2>
            <Ornament />
            <p className="at-lede">
              Tell me what you want to build. I will turn it into a website worth
              bookmarking.
            </p>
            <a className="at-cta" href={mail("Let's build my website")}>
              START A COMMISSION
            </a>
          </div>
        </section>

        <footer className="at-foot">
          <span className="at-meta">© {new Date().getFullYear()} DIETER OLIVIER</span>
          <a className="at-meta" href="https://doli4.github.io/" target="_blank" rel="noreferrer">
            PERSONAL PORTFOLIO
          </a>
        </footer>
      </main>
    </div>
  );
}
