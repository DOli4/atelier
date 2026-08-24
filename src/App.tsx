import { useEffect, useRef, useState, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { img, texture, allArtists, profileUrl, type Credit } from "./images";
import "./App.css";

gsap.registerPlugin(ScrollTrigger);

const EMAIL = "Oli4Dieter@gmail.com";
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

/* Each of the eight photographs is used exactly once across the page. */
const reel = [
  { ...img.chrome, tag: "FORM", name: "Shaped by hand" },
  { ...img.form, tag: "RESTRAINT", name: "One clean gesture" },
  { ...img.glass, tag: "CRAFT", name: "Light, bent" },
  { ...img.car, tag: "PERFORMANCE", name: "Built to last" },
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

function Ornament() {
  return <span className="at-orn" aria-hidden><i /><b /><i /></span>;
}

/** The small gold photographer mark that sits on an image and links out. */
function ShotCredit({ c }: { c: Credit }) {
  return (
    <a className="at-shot-credit" href={profileUrl(c)} target="_blank" rel="noreferrer noopener">
      {c.photographer}
    </a>
  );
}

/**
 * A texture plate. Real photographic surfaces sit under the glass at low
 * opacity with a blend mode, so panels read as a material instead of a flat
 * translucent fill. Purely decorative, hence aria-hidden.
 */
function Plate({ tex, opacity = 0.07, blend = "overlay", parallax }:
  { tex: Credit; opacity?: number; blend?: string; parallax?: number }) {
  return (
    <span
      className="at-plate"
      aria-hidden
      data-parallax={parallax}
      style={{
        backgroundImage: `url(${tex.src})`,
        opacity,
        mixBlendMode: blend as never,
      }}
    />
  );
}

function SplitWord({ text, className }: { text: string; className: string }) {
  return (
    <span className={className} aria-label={text}>
      {text.split("").map((ch, i) => (
        <span className="at-ltr" key={i} aria-hidden>{ch}</span>
      ))}
    </span>
  );
}

function Hero({ mail }: { mail: (s: string) => string }) {
  const [i, setI] = useState(1);
  const tier = tiers[i];
  const go = (d: number) => setI((p) => (p + d + tiers.length) % tiers.length);

  return (
    <section className="at-hero">
      <div className="at-hero-bg" aria-hidden>
        <img src={img.silk.src} alt="" data-hero-bg />
      </div>
      <Plate tex={texture.mica} opacity={0.14} blend="soft-light" />

      <div className="at-panel at-glass" data-panel>
        <Plate tex={texture.ink} opacity={0.06} />
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
          <h1 className="at-wordmark-wrap">
            <SplitWord text="ATELIER" className="at-wordmark" />
          </h1>
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
              <button key={t.id} className={`at-switch-item${k === i ? " is-on" : ""}`}
                onClick={() => setI(k)} aria-current={k === i}>
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

      <ShotCredit c={img.silk} />
    </section>
  );
}

/** Tall glass slab standing in an atmospheric scene, words orbiting on a 3D ring. */
function Monolith({ mail }: { mail: (s: string) => string }) {
  return (
    <section className="at-mono" id="at-mono">
      <div className="at-mono-bg" aria-hidden>
        <img src={img.monolith.src} alt="" data-parallax="0.14" />
      </div>
      <Plate tex={texture.willow} opacity={0.3} blend="screen" />

      <div className="at-orbit" aria-hidden>
        <div className="at-orbit-stage">
          {ORBIT_WORDS.map((w, i) => (
            <span className="at-orbit-word" key={w}
              style={{
                ["--seat" as string]: `${(i * 360) / ORBIT_WORDS.length}deg`,
                ["--delay" as string]:
                  `${(-18 * ((ORBIT_WORDS.length - i) % ORBIT_WORDS.length)) / ORBIT_WORDS.length - 9}s`,
              }}>
              {w}
            </span>
          ))}
        </div>
      </div>

      <div className="at-slab at-glass" data-reveal>
        <Plate tex={texture.mica} opacity={0.09} />
        <div className="at-slab-top">
          <span className="at-meta">ATELIER</span>
          <span className="at-meta">/ 02</span>
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
              <span className="at-meta">{k}</span>
              <strong>{v}</strong>
            </div>
          ))}
        </div>
        <a className="at-cta at-cta-sm" href={mail("Website commission")}>START A COMMISSION</a>
      </div>

      <ShotCredit c={img.monolith} />
    </section>
  );
}

/** One full-bleed statement band — a single cinematic image, words over it. */
function Statement() {
  return (
    <section className="at-band" id="at-work">
      <img className="at-band-img" src={img.ocean.src} alt={img.ocean.alt} data-parallax="0.12" />
      <Plate tex={texture.stone} opacity={0.16} blend="overlay" />
      <div className="at-band-inner">
        <p className="at-label" data-reveal>04 — SELECTED WORK</p>
        <h2 className="at-band-h" data-reveal>CALM<br />UNDER LOAD</h2>
        <p className="at-lede at-band-lede" data-reveal>
          Smooth when the traffic surges. Optimised, accessible, and engineered to
          hold its nerve under pressure.
        </p>
      </div>
      <ShotCredit c={img.ocean} />
    </section>
  );
}

function HorizontalReel({ scrollerRef }: { scrollerRef: RefObject<HTMLDivElement | null> }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [native, setNative] = useState(false);

  useEffect(() => {
    const narrow = window.innerWidth < 860;
    const scroller = scrollerRef.current;
    if (reduced() || narrow || !scroller || !wrapRef.current || !trackRef.current) {
      setNative(true);
      return;
    }
    const wrap = wrapRef.current;
    const track = trackRef.current;
    const ctx = gsap.context(() => {
      const distance = () => track.scrollWidth - wrap.clientWidth;
      gsap.to(track, {
        x: () => -distance(), ease: "none",
        scrollTrigger: {
          trigger: wrap, start: "top top", end: () => `+=${distance()}`,
          scrub: 0.6, pin: true, scroller, invalidateOnRefresh: true,
        },
      });
      // Cards lean into the travel direction — momentum, not a canned loop.
      gsap.fromTo(".at-reel-card",
        { rotateY: 8, scale: 0.95 },
        {
          rotateY: -8, scale: 1, ease: "none", stagger: 0.04,
          scrollTrigger: {
            trigger: wrap, start: "top top", end: () => `+=${distance()}`,
            scrub: 0.8, scroller,
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
              <img src={r.src} alt={r.alt} loading="lazy" />
              <figcaption>
                <span className="at-label">{r.tag}</span>
                <strong>{r.name}</strong>
              </figcaption>
              <ShotCredit c={r} />
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
    const scroller = root.current;
    if (!scroller) return;
    let cancelled = false;
    const isReduced = reduced();

    const ctx = gsap.context(() => {
      if (isReduced) return;

      // Opening: the panel settles, then the wordmark builds letter by letter.
      gsap.timeline({ defaults: { ease: "power3.out" } })
        .from("[data-panel]", { y: 44, scale: 0.985, opacity: 0, duration: 1.15 })
        .from(".at-ltr", { yPercent: 118, opacity: 0, duration: 0.9, stagger: 0.045 }, "-=0.7")
        .from(".at-model, .at-panel-body .at-orn", { opacity: 0, y: 12, duration: 0.7 }, "-=0.5")
        .from(".at-triad article", { opacity: 0, y: 20, duration: 0.75, stagger: 0.09 }, "-=0.45")
        .from(".at-switch-item", { opacity: 0, y: 14, duration: 0.6, stagger: 0.07 }, "-=0.5");

      gsap.to("[data-hero-bg]", {
        yPercent: 12, ease: "none",
        scrollTrigger: { trigger: ".at-hero", start: "top top", end: "bottom top", scrub: true, scroller },
      });

      // Section entrances: content lifts while unblurring — the "rich" feel comes
      // from blur+scale resolving together rather than a bare fade.
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.from(el, {
          y: 46, opacity: 0, filter: "blur(12px)", duration: 1.2, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", scroller },
        });
      });
      gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach((el) => {
        gsap.from(el.children, {
          y: 34, opacity: 0, filter: "blur(8px)", duration: 0.9, ease: "power3.out", stagger: 0.1,
          scrollTrigger: { trigger: el, start: "top 85%", scroller },
        });
      });

      // Headings wipe up behind a mask instead of fading.
      gsap.utils.toArray<HTMLElement>(".at-h2, .at-slab-h, .at-band-h, .at-final-h").forEach((el) => {
        gsap.from(el, {
          clipPath: "inset(0 0 100% 0)", y: 26, duration: 1.15, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", scroller },
        });
      });

      // Texture plates and background images drift at their own rates.
      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        const f = Number(el.dataset.parallax) || 0.12;
        gsap.fromTo(el, { yPercent: -f * 100 }, {
          yPercent: f * 100, ease: "none",
          scrollTrigger: {
            trigger: el.parentElement!, start: "top bottom", end: "bottom top",
            scrub: true, scroller,
          },
        });
      });

      // Bordered grids draw themselves open.
      gsap.utils.toArray<HTMLElement>(".at-grid, .at-stats").forEach((el) => {
        gsap.from(el, {
          scaleX: 0.92, opacity: 0, duration: 1.1, ease: "power3.out", transformOrigin: "center",
          scrollTrigger: { trigger: el, start: "top 88%", scroller },
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

  // Magnetic CTAs — lean toward the cursor, spring back on leave.
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

  const mail = (subject: string) =>
    `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}`;

  return (
    <div className="atelier-page" ref={root}>
      <span className="at-rule" aria-hidden />

      <main>
        <Hero mail={mail} />

        <section id="at-reel" className="at-section at-tex-sec">
          <Plate tex={texture.stone} opacity={0.1} parallax={0.06} />
          <header className="at-sec-head" data-reveal>
            <p className="at-label">01 — THE REEL</p>
            <h2 className="at-h2">SELECTED SURFACES</h2>
            <p className="at-lede">Scroll down, then sideways.</p>
          </header>
          <HorizontalReel scrollerRef={root} />
        </section>

        <Monolith mail={mail} />

        <section id="at-process" className="at-section at-tex-sec">
          <Plate tex={texture.concrete} opacity={0.12} parallax={0.05} />
          <header className="at-sec-head" data-reveal>
            <p className="at-label">03 — HOW IT WORKS</p>
            <h2 className="at-h2">FOUR MOVES</h2>
            <p className="at-lede">No smoke. You always know what happens next.</p>
          </header>
          <div className="at-grid at-grid-4 at-glass" data-stagger>
            {process.map((s) => (
              <article className="at-cell" key={s.k}>
                <span className="at-cell-k">{s.k}</span>
                <h3 className="at-cell-t">{s.t}</h3>
                <p className="at-cell-d">{s.d}</p>
              </article>
            ))}
          </div>
        </section>

        <Statement />

        <section id="at-promise" className="at-section at-tex-sec">
          <Plate tex={texture.ink} opacity={0.14} parallax={0.07} />
          <header className="at-sec-head" data-reveal>
            <p className="at-label">05 — THE PROMISE</p>
            <h2 className="at-h2">WHY WORK WITH ME</h2>
          </header>
          <div className="at-grid at-grid-4 at-glass" data-stagger>
            {promises.map((p) => (
              <article className="at-cell" key={p.t}>
                <h3 className="at-cell-t">{p.t}</h3>
                <p className="at-cell-d">{p.d}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="at-section at-tex-sec">
          <Plate tex={texture.streaks} opacity={0.16} blend="screen" parallax={0.08} />
          <div className="at-stats at-glass" data-reveal>
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

        {/* FINAL — the cloudbank carries this one */}
        <section className="at-close">
          <img className="at-close-img" src={img.clouds.src} alt="" aria-hidden data-parallax="0.1" />
          <Plate tex={texture.marble} opacity={0.12} blend="soft-light" />
          <div className="at-final at-glass" data-reveal>
            <Plate tex={texture.mica} opacity={0.08} />
            <p className="at-label">06 — COMMISSION</p>
            <h2 className="at-final-h">READY TO BUILD</h2>
            <Ornament />
            <p className="at-lede">
              Tell me what you want to build. I will turn it into a website worth
              bookmarking.
            </p>
            <a className="at-cta" href={mail("Let's build my website")}>START A COMMISSION</a>
          </div>
          <ShotCredit c={img.clouds} />
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
