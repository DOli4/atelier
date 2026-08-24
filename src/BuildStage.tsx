import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * The specimen — a website that assembles itself as you scroll.
 *
 * This is the site's whole argument. Rather than claiming craft in copy, the
 * page demonstrates it: one mock interface is pinned and walked through the
 * real stages of building a front-end, from an empty file to a live product.
 *
 * Performance contract for everything below:
 *   - Scrubbed properties are transform and opacity only. The single
 *     exception is the greyscale flood in COLOUR, which runs on one element.
 *   - No backdrop-filter anywhere inside the pinned stage. Frosted glass
 *     during a scrub means a full backdrop re-read every frame.
 *   - The whole stage is skipped under reduced-motion, which gets the
 *     finished specimen at rest instead.
 */

const CHAPTERS = [
  { k: "00", t: "BLANK", d: "Every site starts the same way. An empty file and a cursor." },
  { k: "01", t: "STRUCTURE", d: "Boxes before beauty. Hierarchy is decided here, while it is still cheap to change." },
  { k: "02", t: "TYPE", d: "Words land. Most of the design is already done once the type is right." },
  { k: "03", t: "COLOUR", d: "Colour arrives last, and does the least. It confirms the structure rather than rescuing it." },
  { k: "04", t: "MOTION", d: "Now it moves — to guide the eye, never to decorate. This is the part most sites get wrong." },
  { k: "05", t: "LIVE", d: "Shipped. You have been reading the finished article this whole time." },
];

export default function BuildStage() {
  const root = useRef<HTMLDivElement>(null);
  const [chapter, setChapter] = useState(0);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    // The specimen's unbuilt state is an EMPTY BOX, so anything that stops the
    // timeline running must fall back to the finished article rather than to
    // nothing. Two cases need that:
    //   - reduced-motion, permanently;
    //   - a hidden tab, where rAF is suspended, so Lenis never steps and
    //     ScrollTrigger never updates. That one is temporary, so the build is
    //     armed for real once the tab is actually looked at.
    const finished = () => {
      el.classList.add("is-done");
      setChapter(CHAPTERS.length - 1);
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finished();
      return;
    }

    if (document.visibilityState === "hidden") {
      finished();
      let armed = false;
      const onVisible = () => {
        if (armed || document.visibilityState !== "visible") return;
        armed = true;
        document.removeEventListener("visibilitychange", onVisible);
        el.classList.remove("is-done");
        setChapter(0);
        build(el);
        ScrollTrigger.refresh();
      };
      document.addEventListener("visibilitychange", onVisible);
      return () => document.removeEventListener("visibilitychange", onVisible);
    }

    return build(el);

    function build(node: HTMLDivElement) {
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(node);

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: node,
          start: "top top",
          end: "+=560%",           // six chapters need room to read
          scrub: 0.8,
          pin: ".sp-pin",
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const i = Math.min(
              CHAPTERS.length - 1,
              Math.floor(self.progress * CHAPTERS.length),
            );
            setChapter(i);
          },
        },
      });

      // 00 BLANK — a cursor blinking in an empty file.
      tl.to(q(".sp-caret"), { opacity: 1, duration: 0.4 })
        .to(q(".sp-caret"), { opacity: 0, duration: 0.3 }, ">0.6");

      // 01 STRUCTURE — the wireframe draws itself, outside in.
      tl.to(q(".sp-frame"), { opacity: 1, duration: 0.5 })
        .fromTo(q(".sp-box"),
          { scaleY: 0, transformOrigin: "top center" },
          { scaleY: 1, duration: 0.5, stagger: 0.08 }, "<0.2")
        .to(q(".sp-label"), { opacity: 1, duration: 0.3, stagger: 0.05 }, "<0.3");

      // 02 TYPE — placeholder bars resolve into real words.
      tl.to(q(".sp-bar"), { scaleX: 1, transformOrigin: "left center", duration: 0.4, stagger: 0.04 })
        .to(q(".sp-label"), { opacity: 0, duration: 0.25 }, "<")
        .to(q(".sp-bar"), { opacity: 0, duration: 0.3 }, ">0.2")
        .fromTo(q(".sp-word"),
          { opacity: 0, yPercent: 60 },
          { opacity: 1, yPercent: 0, duration: 0.45, stagger: 0.035 }, "<0.1");

      // 03 COLOUR — the palette floods a greyscale layout.
      // One element carries the filter, so this stays a single paint.
      tl.to(q(".sp-paper"), { filter: "grayscale(0)", duration: 0.9 })
        .to(q(".sp-accent"), { opacity: 1, duration: 0.5 }, "<0.3");

      // 04 MOTION — the flat layout gains depth and life.
      tl.to(q(".sp-card"), { y: -10, duration: 0.5, stagger: 0.07 })
        .to(q(".sp-shadow"), { opacity: 1, duration: 0.5 }, "<")
        .to(q(".sp-cta"), { scale: 1.04, duration: 0.3, yoyo: true, repeat: 1 }, "<0.3");

      // 05 LIVE — browser chrome closes around it: it is a real site now.
      tl.to(q(".sp-chrome"), { opacity: 1, duration: 0.5 })
        .to(q(".sp-paper"), { scale: 0.94, duration: 0.6 }, "<");
    }, node);

    return () => ctx.revert();
    }
  }, []);

  const c = CHAPTERS[chapter];

  return (
    <section className="sp-stage" ref={root} id="at-build">
      <div className="sp-pin">
        <div className="sp-grid">
          {/* Running commentary, driven by the same timeline */}
          <aside className="sp-read">
            <p className="at-label">THE BUILD</p>
            <div className="sp-chapters" aria-hidden>
              {CHAPTERS.map((ch, i) => (
                <span key={ch.k} className={`sp-chap${i === chapter ? " is-on" : ""}`}>
                  {ch.k}
                </span>
              ))}
            </div>
            <h2 className="sp-h" key={c.t}>{c.t}</h2>
            <p className="sp-d" key={c.d}>{c.d}</p>
          </aside>

          {/* The specimen itself */}
          <div className="sp-viewport">
            <span className="sp-caret" aria-hidden />
            <div className="sp-shadow" aria-hidden />

            <div className="sp-chrome" aria-hidden>
              <i /><i /><i />
              <span>dieterolivier.studio</span>
            </div>

            <div className="sp-paper" aria-hidden>
              <div className="sp-frame" />

              {/* nav */}
              <div className="sp-box sp-nav">
                <span className="sp-label">nav</span>
                <span className="sp-bar sp-bar-logo" />
                <span className="sp-word sp-logo">ATELIER</span>
                <span className="sp-navlinks">
                  <span className="sp-bar" /><span className="sp-bar" /><span className="sp-bar" />
                  <span className="sp-word">WORK</span>
                  <span className="sp-word">PROCESS</span>
                  <span className="sp-word">CONTACT</span>
                </span>
              </div>

              {/* hero */}
              <div className="sp-box sp-hero">
                <span className="sp-label">hero</span>
                <span className="sp-bar sp-bar-h1" />
                <span className="sp-bar sp-bar-h2" />
                <span className="sp-word sp-hero-h">BUILT<br />BY HAND</span>
                <span className="sp-bar sp-bar-p" />
                <span className="sp-word sp-hero-p">
                  Designed and coded from an empty file.
                </span>
                <span className="sp-cta sp-accent">
                  <span className="sp-word">START</span>
                </span>
              </div>

              {/* cards */}
              <div className="sp-box sp-cards">
                <span className="sp-label">cards</span>
                {["FAST", "ACCESSIBLE", "YOURS"].map((w) => (
                  <span className="sp-card" key={w}>
                    <span className="sp-bar" />
                    <span className="sp-word">{w}</span>
                    <span className="sp-rule sp-accent" />
                  </span>
                ))}
              </div>

              {/* footer */}
              <div className="sp-box sp-foot">
                <span className="sp-label">footer</span>
                <span className="sp-bar" />
                <span className="sp-word">© ATELIER</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
