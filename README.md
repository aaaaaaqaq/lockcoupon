# LockCoupon SEO Fixes

## File placement

| File in this folder | Replaces / place at |
|---|---|
| `codes-promo_slug_page.tsx` | `app/codes-promo/[slug]/page.tsx` (replace) |
| `blog_slug_page.tsx` | `app/blog/[slug]/page.tsx` (replace) |
| `sitemap.ts` | `app/sitemap.ts` (replace) |
| `CouponSchema.tsx` | `components/CouponSchema.tsx` (replace) |
| `StoreLogo.tsx` | `components/StoreLogo.tsx` (replace) |
| `RelatedStores.tsx` | `components/RelatedStores.tsx` (NEW) |
| `BlogRelated.tsx` | `components/BlogRelated.tsx` (NEW) |
| `llms.txt` | `public/llms.txt` (NEW) |

## What was fixed

### 🔴 Critical
1. **Titles too long (83 pages)** — `codes-promo/[slug]/page.tsx` now builds
   `Code Promo {store} {month} {year}` and falls back to `Code Promo {store} {year}`
   if the first version exceeds 60 chars. "BonPlan.ma" is gone everywhere.
2. **Duplicate titles (24 pages)** — every store title now includes the current
   month, making each page unique. Blog JSON-LD also gets a unique `mainEntityOfPage`
   and `url`.
3. **Structured data errors (47)**
   - Blog `BlogPosting`: added `mainEntityOfPage`, `url`, `image` as `ImageObject`
     with `width`/`height`, and publisher `logo` as `ImageObject` with dimensions.
   - Store Offers: every `Offer` now has required `price: "0"` and
     `priceSpecification` with `price`/`priceCurrency`, plus `validFrom`.
4. **Sitemap bad URLs (7)** — `sitemap.ts` now filters out any store/post without
   a valid string slug before generating entries.
5. **Broken external images (27)** — `StoreLogo.tsx` now has a two-level fallback:
   primary `logo_url` → Clearbit (`https://logo.clearbit.com/{name}.com`) → letter
   placeholder. Added `loading="lazy"` and an `alt` that includes "Logo".

### 🟡 Important
6. **Low text/HTML ratio (108 pages)** — already partially addressed via the
   existing `StoreAboutSection` + `StoreFAQSection`. The new `RelatedStores`
   component adds another meaningful content block (headings, list, nav) to every
   store page.
8. **Pages with 1 internal link (177)**
   - Store pages now render `<RelatedStores>` with 8 related-store links + 3
     site-nav links (boutiques, top, blog).
   - Blog posts now render `<BlogRelated>` with 4 related posts + 8 popular
     stores + 3 site-nav links.

### 🟢 Nice to have
9. **llms.txt** — created at `public/llms.txt` exactly as specified.
10. **Low semantic HTML (6)** — blog post page now uses `<main>` wrapping
    `<article>`, and both Related components use `<aside>` + `<nav>` + `<ul>`.
    Apply the same `<main>` wrapper pattern to other top-level pages
    (`boutiques`, `top-codes-promo`, `a-propos`, `contact`, `guide-achat`) as
    needed — it's a one-line change per page.

## Not code — still to do

- **Broken logos in DB (Fix 5):** the code now falls back gracefully, but the
  underlying DB values are still bad. Run a one-off SQL update in Supabase to
  switch google-favicon URLs to Clearbit:
  ```sql
  update stores
  set logo_url = 'https://logo.clearbit.com/' || lower(replace(name, ' ', '')) || '.com'
  where logo_url like '%google.com/s2/favicons%';
  ```
- **Low word count (4 pages, Fix 7):** identify the 4 pages in your SEO export
  (likely `contact`, `a-propos`, empty category, etc.) and add 300+ words of
  real content. This can't be generated without knowing which pages they are.
- **Text/HTML ratio (Fix 6):** if still flagged after deploy, consider
  adding a 150–200 word "À propos de {store}" paragraph pulled from a new
  `about` column on the `stores` table.
