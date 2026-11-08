# बजरंगी (Bajrangee) — brand website

A complete brand site for **बजरंगी — मातल भ्रेसा / अन्नपूर्णा भोजन थाल**, built
from the original one-pager shot, the original brand artwork and the retail
posters. The footer follows the Eshanura house footer, and the shared
furniture — header actions, drawers, filter chips, order list — follows
`nuts.eshanura.com` so the brand family reads as one family.

## Pages

| File | What it is |
| --- | --- |
| `index.html` | Home — hero, trust strip, pack contents, category cards, three size rows, distributor band, about band |
| `products.html` | Full catalogue with filter chips, specification cards and size reference tables |
| `range-dona.html` | The dona range — hero, specification grid, size table, bulk-enquiry block |
| `range-plates.html` | The plate range, on the same template |
| `range-thali.html` | The अन्नपूर्णा भोजन थाल pack, on the same template |
| `distributors.html` | B2B pitch, network, four-step onboarding, enquiry form, FAQ |
| `retailers.html` | The shop-facing side of the same network — how a store stocks Bajrangee |
| `about.html` | Brand story, quality and safety, product range |
| `contact.html` | Contact details, WhatsApp and a general enquiry form |
| `legal.html` | Privacy policy and terms & conditions |

## Sources

`extract.py` pulls every asset out of the original files in `Downloads`:

| Source | What it provides |
| --- | --- |
| `New folder (3)/Download/Bajrangi (1).png` (4987×2933, transparent) | The master logo — peacock, flute and gold-edged wordmark |
| `Rainbow Gradient "eshanura" Wordmark.png` (2172×724) | The parent-company mark, identical to the one on nuts.eshanura.com |
| `Bajrangi Annpoorna Thali Retail Poster.jpg` (1024×1536) | The hero pack, the round label, the food plate, the ISO seal |
| `Bajrangi website.png` (814×1931) | The original one-pager — category-card photography and the individual size shots |

Repairs made on the way in:

- The header lockup in the one-pager is clipped by the top of the frame, so the
  master artwork is used for every placement instead.
- The category-card photography had Hindi headlines and arrow buttons burned
  into it. Those pixels are removed with OpenCV inpainting, so the same photos
  carry real, selectable HTML text.
- The pack label is a circle photographed at a slight angle, so it reads as an
  ellipse and is presented as a rounded plate rather than forced into a circle.
- The favicon is built as a brand-red tile carrying the `ब` glyph alone, because
  the full lockup turns to mush below 32px.

The `Bajrangi_Logo_white` files in the same folder are *not* used: they carry a
white wordmark on a canvas that does not line up with the colour lockup, and
the dark call-to-action band closes on the real logo reversed out on a cream
chip instead.

## This is a corporate B2B site, not a shop

There is no cart, no basket, no checkout and no prices anywhere on the site.
Bajrangee sells to businesses — hotels, caterers, canteens, dhabas and
retailers — who buy in bulk against a rate card. The only transaction on the
site is an enquiry.

So the shared furniture is:

- **Specification finder** — live search over the range by name, size or use;
  each result links to the product's specification.
- **Range filters** — `सभी / दोना रेज / सिल्वर दोना / प्लेट रेज`, with
  `aria-pressed` state and a live count.
- **Bulk enquiry** — the range ends in a "दाम और MOQ जानना है?" block that
  opens WhatsApp; the same route is repeated in the footer, on every form and
  in the mobile action bar.
- **Sectors** — who we supply and what each segment gets.
- **Back to top** — appears after 700px of scroll.

`assets/js/catalogue.js` holds the single source of truth for the range
(`window.BJR_CATALOGUE`); the static markup carries the same values in
`data-*` attributes so the grid is meaningful to search engines without
running JavaScript.

`interact.py` asserts that no commerce furniture reappears — it fails if
`data-add`, `data-bag`, `panel-bag`, `ऑर्डर सूची`, `checkout` or `cart`
reappear in any page.

## Build

```bash
python extract.py    # rebuild assets/img from the source files
python build.py      # write the seven HTML files
python qa.py         # link / a11y / console / overflow checks, 3 viewports
python interact.py   # drives the order list, search, filters and mobile nav
python shoot.py      # render every page at 1440, 834 and 390 px
```

`build.py` writes plain static HTML — the output needs no runtime.

## Design notes

- **Palette** sampled off the master logo: brand red `#e60000` on cream
  `#fbf8f3`, with the Eshanura rainbow reserved for the parent-company mark.
- **Contrast** small red text uses a dedicated `--red-text: #b30000` rather
  than the display red, and `--ink-3` was darkened to `#6f6156`, so every
  supporting line clears WCAG AA on cream.
- **Devanagari is never letter-spaced** — tracking breaks the conjuncts.
- **Type**: Tiro Devanagari Hindi for display, Poppins for Latin interface
  text, Noto Sans Devanagari for Devanagari body copy.
- **Footer** mirrors the Eshanura house footer — brand block with the parent
  company and ISO seal, link columns, customer care, an "order direct" block
  and the legal bar.
- Everything degrades without JavaScript: the scroll reveal is scoped to `.js`,
  so with scripting off the content is simply visible.

## Checks

The product photographs are re-cut from the posters at native resolution and
tightened to each product's own bounds at one scale, so a bigger diameter
genuinely renders bigger.

`qa.py` verifies, at all three viewports, that there are no broken images,
broken internal links, console errors, horizontal overflow, missing `alt`
text, unnamed links or buttons, heading-level jumps, or form fields without
labels. `interact.py` drives the order list, search drawer, filter chips and
mobile navigation. Both currently pass clean.
