/**
 * Every image on the site, with verified attribution.
 *
 * Each `id` is the real Unsplash photo ID (taken from the original download
 * filename) and every `handle` was confirmed against the live Unsplash page.
 * Do NOT derive handles from a photographer's name — they frequently differ
 * (Max Zhdanov is @s1qf0, Callum Mullin is @cmbgraphicdesign, František G.
 * is @fandyus).
 *
 * Licence: used under the Unsplash Licence — free for commercial and
 * non-commercial use, no permission required. NOT public domain, NOT CC0:
 * the photographers keep copyright, the images may not be sold as unmodified
 * copies, and they may not be compiled to build a competing photo service.
 */
export type Credit = {
  src: string;
  alt: string;
  photographer: string;
  handle: string;
  id: string;
};

const BASE = "/atelier";

const make = (dir: string) =>
  (file: string, alt: string, photographer: string, handle: string, id: string): Credit =>
    ({ src: `${BASE}/${dir}/${file}`, alt, photographer, handle, id });

const shot = make("work");
const tex = make("tex");

/** Content photographs — each appears exactly once on the page. */
export const img = {
  silk: shot("silk.webp", "Black glossy waves folding through darkness",
    "Pawel Czerwinski", "pawel_czerwinski", "5mhH4db_79I"),
  monolith: shot("monolith.webp", "A dark cuboid floating above still water, lit from within",
    "Max Zhdanov", "s1qf0", "CWEpEBhCvg8"),
  chrome: shot("chrome.webp", "Polished black metallic forms against white",
    "Default Cameraman", "default_cameraman", "AWb8SQc3vS0"),
  form: shot("form.webp", "A single curved sculptural surface in near-darkness",
    "Milad Fakurian", "fakurian", "DjjaZybYx4I"),
  clouds: shot("clouds.webp", "Dense white cloudbanks parting over black",
    "Ramiro Pianarosa", "rpianarosa", "xUpbQ9GX7SQ"),
  car: shot("car.webp", "Low-light study of a car body",
    "Cash Macanaya", "cashmacanaya", "CWSud7L3yYc"),
  ocean: shot("ocean.webp", "Open ocean under heavy weather",
    "Callum Mullin", "cmbgraphicdesign", "snUYE3muAQg"),
  glass: shot("glass.webp", "Light refracting through textured glass",
    "Resource Database", "resourcedatabase", "MyRiM9mdTUo"),
} satisfies Record<string, Credit>;

/**
 * Surface textures. These never appear as pictures — they sit under the glass
 * at very low opacity so panels read as a material rather than a flat fill.
 * Still real people's work, so still credited (in the footer).
 */
export const texture = {
  mica: tex("mica.webp", "", "Susan Wilkinson", "susan_wilkinson", "YQulhkRDsr4"),
  ink: tex("ink.webp", "", "Susan Wilkinson", "susan_wilkinson", "T-qxQbQb3mU"),
  streaks: tex("streaks.webp", "", "Rene Böhmer", "qrenep", "YeUVDKZWSZ4"),
  stone: tex("stone.webp", "", "Sergey Kotenev", "sergeykotenev", "-gWSFS8rrVg"),
  concrete: tex("concrete.webp", "", "František G.", "fandyus", "XXuVXLy5gHU"),
  marble: tex("marble.webp", "", "Juliette Páez Tobar", "lajulia", "YOqYqrQfjKM"),
  willow: tex("willow.webp", "", "DAVIDCOHEN", "davcohpho", "2wACWpi2RBU"),
} satisfies Record<string, Credit>;

export const profileUrl = (c: Credit) => `https://unsplash.com/@${c.handle}`;
export const photoUrl = (c: Credit) => `https://unsplash.com/photos/${c.id}`;

/**
 * One entry per photographer for the footer line, de-duplicated — Susan
 * Wilkinson contributed two textures but should be named once.
 */
export const allArtists: { photographer: string; handle: string }[] = (() => {
  const seen = new Map<string, string>();
  for (const c of [...Object.values(img), ...Object.values(texture)]) {
    if (!seen.has(c.handle)) seen.set(c.handle, c.photographer);
  }
  return [...seen].map(([handle, photographer]) => ({ handle, photographer }));
})();
