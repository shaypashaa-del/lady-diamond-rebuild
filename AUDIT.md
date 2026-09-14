# Lady Diamond Jewels — Live Site Audit
Source: https://ladydiamondjewels.com (WordPress + WooCommerce, "Jewelry Story"/Ascella theme by Qode Interactive, JoinChat WhatsApp plugin, YITH Compare/Wishlist plugins)
Audited: 2026-09-14, read-only browsing only. Site is in-progress and contains Lorem Ipsum placeholder copy in multiple places (explicitly noted below).

---

## 1. Sitemap (top-level pages found)

| Page | URL |
|---|---|
| Home | `https://ladydiamondjewels.com/` |
| Shop (main product archive) | `https://ladydiamondjewels.com/product-category/jewelry/` |
| About Us | `https://ladydiamondjewels.com/about-us/` |
| Blog (linked in nav as "Blog" but points to a category archive) | `https://ladydiamondjewels.com/category/gold/` |
| Contact Us | `https://ladydiamondjewels.com/contact-us/` |
| Affiliate Program (landing) | `https://ladydiamondjewels.com/affiliate-registration-2/` |
| Affiliate Login | `https://ladydiamondjewels.com/affiliate-login/` |
| Affiliate Area | `https://ladydiamondjewels.com/affiliate-area/` |
| Affiliate Reset Password | `https://ladydiamondjewels.com/affiliate-reset-password/` |
| Affiliate Registration | `https://ladydiamondjewels.com/affiliate-registration/` |
| Affiliate Account | `https://ladydiamondjewels.com/affiliate-account/` |
| Cart | `https://ladydiamondjewels.com/cart/` |
| Checkout | `https://ladydiamondjewels.com/checkout/` |
| My Account (login) | `https://ladydiamondjewels.com/my-account/` |
| Wishlist (YITH) | `https://ascella.qodeinteractive.com/wishlist/` — **note: this links to the theme demo domain, not the live site** — a leftover/unconfigured link, needs fixing in rebuild |
| Search results | `https://ladydiamondjewels.com/?s=<query>&post_type=product` |

There is an active "Affiliate Program" feature (likely AffiliateWP or similar plugin) — a full referral/affiliate portal with its own login/registration/reset-password/account pages, separate from WooCommerce My Account.

---

## 2. Product categories

Categories observed (from mega-menu, shop pages, and product taxonomy chips), with hierarchy under `/product-category/`:

- **Jewelry** (top/parent) — `/product-category/jewelry/` — 13 products, used as the "Shop" link target
  - **Style** (sub-taxonomy grouping, not directly browsable as own archive in nav but present as `/product-category/style/...`)
    - **Earrings** — `/product-category/style/earrings/`
    - **Rings** — `/product-category/style/rings/`
    - **Bracelets** — `/product-category/style/bracelets/`
- **Accessories** — appears as a product category badge on products (e.g. Circle Necklace) — no dedicated nav link found; likely reachable at `/product-category/accessories/`
- **Beauty bracelests** [sic — actual site typo, kept verbatim] — appears as a category badge; homepage banner also labeled "BEAUTY BRACELESTS"
- **Unique** — category badge seen on some products (e.g. "Black Set", "Bracelet")
- **925 Silver** — category/attribute-like label seen on Simple Ring, Circle Ring
- **New Collection** — appears as a category label on "Earrings Plate" in search results
- **Gold**, **Gold Plating**, **Golden Line** — additional category/attribute labels seen scattered across search results (Spiral Ring = "Gold", Woo Earrings/Nouvates Earrings = "Gold Plating", Eyes Earrings/Earrings Plate = "Golden Line")

Note: category taxonomy is inconsistently used — some "categories" shown under products look more like material/style tags than a clean category tree (typical of demo content not yet cleaned up). A rebuild should design one clean category taxonomy (e.g. Earrings / Rings / Bracelets / Necklaces) rather than copying this mix.

---

## 3. Sample of actual products

| Name | Price | Variants? | Category shown | URL |
|---|---|---|---|---|
| Circle Necklace | 52.00 ₪ | Yes — "Colors" dropdown: Gold / Silver | Accessories, Beauty bracelests | `/product/circle-necklace/` |
| Small Earrings | 46.00 ₪ | No (direct Add to Cart) | Accessories | `/product/small-earrings/` (slug inferred) |
| Circle Earrings | 56.00 ₪ | Yes ("Select Options") | Accessories | `/product-category/style/earrings/` listing |
| Heart Bracelet | 62.00 ₪ | No | Accessories | `/product/heart-bracelet/` |
| Simple Ring | 62.00 ₪ | No (has qty selector, direct Add to Cart) | 925 Silver | `/product/simple-ring/` |
| Black Set | 110.00 ₪ | No | Jewelry / Unique | `/product/black-set/` (slug inferred) |
| Bracelet | 98.00 ₪ | No | Jewelry / Unique | `/product/bracelet/` (slug inferred) |
| Bracelet Heart | 68.00 ₪ | Yes ("Select Options") | Jewelry | listing only |
| Mix Necklaces | 82.00 ₪ | Yes ("Select Options") | Beauty bracelests, Jewelry | listing only |
| Ring | 102.00 ₪ | No | Rings | `/product/ring/` |
| Spiral Ring | 53.00 ₪ | No | Gold | `/product/spiral-ring/` — has "New" badge |
| Nouvates Earrings | 79.00 ₪ (was 88.00 ₪) | No | Gold Plating | `/product/nouvates-earrings/` — has "Sale" + "New" badges, shows struck-through original price |
| Woo Earrings | (no price shown, "Read More" instead of Add to Cart) | — | Gold Plating | out-of-stock/variable-without-price product — shows "Sold" badge |
| Circle Ring | 56.00 ₪ | Yes ("Select Options") | 925 Silver | shows "Sold" badge despite being purchasable-looking (placeholder inconsistency) |

Prices are in Israeli new shekel (₪ / ILS). SKUs are visible on product pages (e.g. Circle Necklace SKU `021`, Simple Ring SKU `144`). Products carry a Weight and Dimensions field (e.g. Circle Necklace: 0.3 kg, 15×17×4 cm) under "Additional Information" tab.

---

## 4. Header structure (desktop)

Top to bottom, full width:
1. **Announcement bar**: light beige background, centered text `Free express worldwide shipping.` followed by a bold/underlined link `Subscribe to discover` (href="#" — not wired to anything). Has a small "×" close button on the far right to dismiss.
2. **Main header row** (white background):
   - **Left**: Logo — "LADY DIAMOND" wordmark stacked over "SINCE 2010" in small caps, with a small diamond glyph above the wordmark. Logo links to `/`.
   - **Center**: Primary nav (desktop, ≥ some breakpoint) is NOT shown inline — instead the entire nav is tucked behind a hamburger-style menu icon even on desktop (three horizontal lines icon, top right). Clicking it opens an off-canvas/side panel (behavior not fully visually confirmed in automated testing, but the DOM contains a full "Top Menu" navigation with dropdowns — see Section 6).
   - **Right**: hamburger/menu icon only visible in header at desktop width tested (1024px) — no separate visible search/cart/account icons at that width; a search form, cart ("Shopping Bag" flyout showing "No products in the cart." when empty), and account/wishlist icons exist in the DOM (wishlist icon links out to the theme demo site — a bug) but are likely revealed inside the opened side panel rather than sitting inline in the header bar.
3. No sticky-scroll behavior could be conclusively confirmed via automation (would need to observe on-scroll pinning in a live visual session); treat as unconfirmed.

## 4b. Header structure (mobile, 375px width)

- Announcement bar not visible in the mobile screenshot captured (may be hidden or scrolled).
- Logo: same lockup, slightly smaller, top-left.
- Right side: single hamburger icon (☰), no visible inline search/cart/account icons — consistent with desktop, everything is behind the hamburger.
- Product grid switches to **2 columns** (from an implied 3-4 columns on desktop).

---

## 5. Footer structure

The footer is a 4-column top area + 2-column bottom bar, but is **mostly unpopulated placeholder content**:

**Top area (4 columns):**
1. Column 1: "Lady Diamond Shop" heading + a small image widget (a generic "clients/footer-logo" placeholder image, `footer-logo-clients-img-x2.png`, linking to `#`).
2. Column 2: heading only — **"General"** — no links/menu populated under it.
3. Column 3: heading only — **"About"** — no links populated.
4. Column 4: heading only — **"Categories"** — no links populated.

(These three headings are clearly meant to hold footer nav menus — e.g. General → Home/Shop/Contact, About → About Us, Categories → category links — but no menu widget has been assigned yet in the WP admin.)

**Bottom bar (2 columns, space-between):**
- Left: `© Since 2010 Shay Pasha, All Rights Reserved` — the "Shay Pasha" text is a broken link (`href="https://Shay Pasha/"`, invalid URL, opens in new tab to nowhere).
- Right: `ladydiamondjewels.com` styled as a link, but its actual href is `mailto:diana@ladydiamondjewels.com` — i.e., the visible footer contact email is diana@ladydiamondjewels.com.

**Not present in footer:** no social media icons, no newsletter signup form, no payment method icons, no secondary link columns beyond the three empty headings.

---

## 6. Main navigation / dropdown structure

Full nav tree (from DOM, "Top Menu"), in order:

- **Home** → `/`
- **Shop** → `/product-category/jewelry/` — has a mega-menu dropdown with multiple sub-columns:
  - **Earrings** (`/product-category/style/earrings/`) → child links: Pearl Earrings, Line Earrings, Elegant Earrings, Nouvates Earrings, Nouvates Earrings (duplicate entry)
  - **Rings** (`/product-category/style/rings/`) → child links: Simple Ring, Wedding Ring, Circle Ring, Spiral Ring, Duble Ring, Spiral Ring (duplicate)
  - **Bracelets** (`/product-category/style/bracelets/`) → child links: Heart Bracelet, Small Bracelet, Big Bracelet
  - **Necklaces Set** (links directly to a single product `/product/necklaces-set/` rather than a category) → child links: Necklace pearl, Pearl Hoop, Flat Earrings
  - Plus a long flat list of ~11 more individual product links appended directly under Shop (Small Diamonds, Ring, Heart Hoop, Amorph Pendant, Grean Details [sic], Flowers, New Necklaces, Circle Necklace, Diamond Ring, Flower Ring) — this looks like an auto-generated/unpruned "featured products in menu" mega-menu rather than an intentional IA. **In the rebuild, replace with a clean 3–4 category mega-menu (Earrings / Rings / Bracelets / Necklaces), each showing real subcategories or a curated "shop the look" image tile, not a dump of every product.**
- **About Us** → `/about-us/`
- **Blog** → `/category/gold/` (mislabeled — points to a blog category archive named "gold", not a real blog index)
- **Contact Us** → `/contact-us/`
- **Affiliate Program** → `/affiliate-registration-2/` — has its own dropdown: Affiliate Login, Affiliate Area, Affiliate Reset Password, Affiliate Registration, Affiliate Account

---

## 7. Desktop vs. mobile differences

- Desktop (1024px tested): announcement bar visible; header nav fully hidden behind hamburger even at this width (same icon-only header as mobile) — this theme apparently uses an off-canvas menu at all breakpoints rather than a horizontal bar, OR the mega-menu only expands on a wider breakpoint than 1024px (not confirmed — worth checking at 1440px+ in a manual pass).
- Mobile (375px tested): product grid collapses from more columns to **2 columns**; hamburger persists; no visible separate search/account/cart icons in the header strip.
- Both: quick-view/wishlist/compare icons on product cards appear as an overlay revealed on hover (desktop) — on mobile these icons are shown by default/always-visible (no hover state on touch), overlapping the product image (eye icon = Quick View, heart = Wishlist, second eye icon = something duplicated/Compare — icon set looked redundant, worth simplifying in rebuild).

---

## 8. Homepage — section by section (top to bottom)

1. **Announcement bar**: "Free express worldwide shipping." + "Subscribe to discover" link.
2. **Header** (logo + hamburger), described above.
3. **Hero / large empty space** — a hero banner area renders above the fold but no image/text content loaded during audit (likely a slider/carousel image that lazy-loads or is currently blank/placeholder — could not confirm hero copy).
4. **"LATEST BEAUTY"** — product grid section, heading centered, 3-4 columns desktop / 2 columns mobile. Cards show: product image, hover-revealed eye/heart/eye icons, product name (uppercase), category text under name, price, and either "ADD TO CART" (simple product) or "SELECT OPTIONS" + a note "This product has multiple variants. The options may be chosen on the product page" (variable product). Products seen here: Circle Necklace (52.00₪), Small Earrings (46.00₪), Circle Earrings (56.00₪), Heart Bracelet (62.00₪).
5. **"SOPHISTICATED"** — a large category banner tile (photo of a necklace on skin, decorative circle-line graphic overlay, centered caption "SOPHISTICATED") with a **"FIND MORE"** link/button.
6. **"BEAUTY BRACELESTS"** — adjacent banner tile (photo of a bracelet on fabric, boxed border, caption "BEAUTY BRACELESTS") with its own **"FIND MORE"** link. (Sits side-by-side with #5 in a 2-up grid.)
7. **"MORE CATEGORIES"** heading, followed by Lorem Ipsum placeholder body copy: *"Lorem Ipsum estibulum blandit libero atretenem turmauristeu con dimentum"* — confirms this section's copy has not been finalized — with a **"FIND MORE"** link.
8. **"NEW EARRINGS"** banner — another category tile with **"FIND MORE"** link.
9. **"NEW COLLECTION"** section — heading "NEW COLLECTION", sub-line "ELSA PARETTY JEWELRY" styled as a designer/collection name, Lorem Ipsum body copy *"Lorem Ipsum estibulum blandi"*, and a **"SHOP NOW"** button.
10. **"Euphoria"** — appears to be another named collection/product spotlight block with a **"SHOP MORE"** button.
11. **"OUR PARTNERS"** — a logo strip section (brand/partner logos — content not verified visually, but the heading and section container exist).
12. **"KIND WORDS"** — testimonials section (heading present; testimonial content not captured in text extraction, likely rendered as a slider needing JS/image content).
13. **"INSTAGRAM"** — social feed heading, sub-label "Jewelry Story" and handle "@QODEINTERACTIVE" — **note: this is literally the theme demo's Instagram handle, not the store's own — must be replaced with the real handle in rebuild.**
14. Footer (see Section 5).

Overall the homepage follows a fairly standard jewelry-boutique template: hero → new-arrivals grid → 2 lifestyle category banners → promo/category CTA → seasonal "new collection" spotlight → second spotlight ("Euphoria") → partner logos → testimonials → Instagram grid → footer.

---

## 9. Single product page (audited: Circle Necklace, `/product/circle-necklace/`)

- **Breadcrumb**: `Home / Shop / Accessories / Circle Necklace`
- **Gallery**: vertical thumbnail strip on the left, large main image on the right (at least 2 images seen for Simple Ring: a lifestyle/model shot and a plain product shot).
- **Title**: "CIRCLE NECKLACE" (uppercase).
- **Price**: `52.00 ₪`.
- **Short description**: Lorem Ipsum placeholder ("Lorem Ipsum estibulum blandit libero at mauris condimentum males uada scelerisque in mauris ut malesuada.") — appears on every product checked, i.e. **no real short descriptions have been written for any product yet.**
- **Variant selector**: "COLORS" — a dropdown (`Choose an option…`) with options **Gold / Silver**, plus a "CLEAR" link to reset selection. (This is the only variant/attribute type observed across the catalog — no size selector seen anywhere.)
- **Quantity stepper + Add to Cart**: seen on simple products (e.g. Simple Ring) as a numeric input with +/- and an "ADD TO CART" button; variable products (like Circle Necklace) show the attribute dropdown instead until a variant is chosen, after which presumably a similar qty+Add to Cart appears (WooCommerce default behavior).
- **Add to Wishlist** link/icon below the price/options block.
- **Share** icons (label "SHARE:" present, icon set not enumerated).
- **Meta row**: SKU (e.g. `021`), Categories (e.g. "Accessories, Beauty bracelests"), Tags (e.g. "Gold Jewerly" [sic]).
- **Tabs**: `DESCRIPTION`, `ADDITIONAL INFORMATION`, `REVIEWS (0)`.
  - Description tab content includes a sub-heading "ABOUT DESIGN" with Lorem Ipsum paragraphs, plus three named sub-sections with their own headings and Lorem Ipsum copy: "SUMMER COLLECTION", "PEARL INTUITION", "SERENITY BLUE SANDSTONE" — these read like reusable marketing blurb templates, not real per-product content.
  - Additional Information tab: Weight (e.g. `0.3 kg`), Dimensions (e.g. `15 × 17 × 4 cm`), and the variant attribute (Colors: Gold, Silver).
  - Reviews tab: standard WooCommerce review form — "There are no reviews yet." / "Be the first to review…" with a 1–5 star rating field, name/email/website checkbox ("Save my name, email, and website…"), Submit button. (Did not submit — read-only.)
- **Related Products** section at the bottom: shows 2+ other products as cards (e.g. Modern Earrings 68.00₪, Pearl Earrings 72.00₪), each with the same Select Options/Add to Cart + Compare pattern as grid cards.

---

## 10. Category/shop listing page (audited: `/product-category/jewelry/`)

- Breadcrumb: `Home / Shop / Jewelry`.
- Results count line: `Showing 1–12 of 13 results`.
- **Sort dropdown** (top right): Default sorting / Sort by popularity / Sort by average rating / Sort by latest / Sort by price: low to high / Sort by price: high to low — standard WooCommerce sort widget.
- **No visible sidebar filters** (no price-range slider, no attribute/color/category checkbox filters) were found on the category page — filtering appears to be sort-only, no faceted filtering.
- **Grid**: responsive columns (appeared as 2–3 per row at ~1024px viewport during testing; homepage grid rendered 3 across at same width — minor inconsistency to normalize in rebuild).
- **Card contents**: product image (lazy-loaded), hover overlay with Quick View / Wishlist / Compare icons, product title (uppercase), category label(s) under title, price, "ADD TO CART" (simple) or "SELECT OPTIONS" + variant note (variable), and a "COMPARE" text button/link under the price.
- **Pagination**: numbered pager at bottom, e.g. `01 / 02` seen on the 13-result Jewelry category (12 per page) and `01 / 02 / 03` on the 34-result search-for-"ring" page — clean numbered pagination, not infinite scroll or "load more".
- **Badges**: "New" ribbon badge (e.g. Spiral Ring), "Sale" badge with strikethrough original price + new price (e.g. Nouvates Earrings: `88.00 ₪` struck through → `79.00 ₪`), and "Sold" badge for out-of-stock items (e.g. Circle Ring, Woo Earrings) which also swaps the CTA to "READ MORE" instead of Add to Cart when out of stock/no direct price.
- **Quick View** (tested): hovering a product image and clicking its "eye" icon opens a **centered modal** (not full page) containing: close (×) button top-right, product image on the left half, and on the right half — product title, price, short description (Lorem Ipsum), a quantity stepper, an "ADD TO CART" button, and a "VIEW DETAILS" link at the bottom to go to the full product page. Confirmed working via automated test on "Black Set" (110.00₪).

---

## 11. Cart page (`/cart/`)

- Breadcrumb: `Home / Cart`.
- **Empty state**: "Your cart is currently empty!" plus a "New in store" upsell strip showing 4 products with quick Add to Cart/Compare buttons (Pearl Hoop 95.00₪, Flat Earrings 68.00₪, Small Diamonds 75.00₪, Ring 102.00₪) — a cross-sell block WooCommerce shows on an empty cart.
- **Populated state** (tested by adding Simple Ring + Ring): two-column layout —
  - Left: **line-item table**, no header row visible other than "PRODUCT / TOTAL" (table headers seen in text extraction: "PRODUCT", "DETAILS", "TOTAL"). Each row: small product thumbnail, product name (linked), unit price, short Lorem Ipsum description repeated per line item, a quantity stepper (–, numeric input, +), a trash/remove icon, and a line total.
  - Right: **"CART TOTALS"** box — "Add coupons" (collapsible/expandable — confirmed a coupon entry affordance exists), "Free shipping" row marked "FREE", "Estimated total" (e.g. `164.00 ₪` for the two test items: 62.00 + 102.00), and a dark **"Proceed to Checkout"** button.
- **Observed quirk**: adding an item via the on-page "Add to Cart" button on a product page showed a success message ("Simple Ring has been added to your cart") but did not persist into the cart mini-widget/cart page on a fresh navigation — the cart only reliably updated using the classic `?add-to-cart=<id>` GET link. This points to a **caching layer (e.g. LiteSpeed Cache, seen in the DOM as `litespeed-loaded` classes) not fully excluding cart/AJAX fragments** — a real bug on the live site worth flagging to the client, and something the Next.js rebuild should avoid by using a proper client-side cart (not full-page caching of cart state).

---

## 12. Checkout page (`/checkout/`, not submitted)

- Breadcrumb-less; shows a "Have a coupon? Click here to enter your code" expandable link at top.
- **Billing Details form fields**: First name*, Last name*, Country/Region* (full searchable country dropdown, defaulted list includes every country; "Israel" appended/selected at the end of the dropdown list in the extracted text, suggesting it may be the default), Street address*, Apartment/suite/unit (optional), Postcode/ZIP*, Town/City*, Phone (optional), Email address*, and a checkbox "I would like to receive exclusive emails with discounts and product information".
- A **"Ship to a different address?"** toggle/checkbox.
- **Order notes** (optional) textarea.
- **Order summary** ("YOUR ORDER"): line items with qty × price (e.g. "Simple Ring × 1 — 62.00 ₪", "Ring × 1 — 102.00 ₪"), Subtotal, Shipment ("Free shipping"), Total.
- **Payment methods offered**: "DIRECT BANK TRANSFER" (with instructions: "Make your payment directly into our bank account. Please use your Order ID as the payment reference. Your order will not be shipped until the funds have cleared in our account.") and "CASH ON DELIVERY". **No card/PayPal/Stripe gateway is configured** — only manual offline payment methods.
- Privacy policy consent line + dark **"PLACE ORDER"** button (not clicked).

---

## 13. My Account / Login page (`/my-account/`)

- Only a **Login** form is shown by default: Username or email address* (marked "Required"), Password* (marked "Required"), "Remember me" checkbox, dark "LOG IN" button, and a "Lost your password?" link.
- **No registration form is visible on this page** — WooCommerce customer registration appears to be disabled (the default WooCommerce My Account page shows both Login and Register side-by-side when registration is enabled; here only Login renders), so new customers cannot self-register through this page as configured. This is a real config detail to decide on for the rebuild (enable/keep disabled).
- Separate **Affiliate** login/registration/account/reset-password pages exist independently of this (see Section 6) — a different, second account system for affiliates only.

---

## 14. Search

- **Icon/box**: a search form exists in the header markup (`textbox "Search"` with a submit button) — presumably revealed via the hamburger panel or a dedicated search icon/overlay (not visually confirmed open in the automated pass, but present in the DOM as a `<form>` inside the header banner region).
- **Search results page** (tested with query "ring" via `/?s=ring&post_type=product`): title becomes `Search Results for "ring"`; layout matches the category listing page exactly — sort dropdown defaults to "Relevance" (extra option not present on category pages), same product-card grid, same "New"/"Sale"/"Sold" badges, same pagination style (`01 02 03` for 34 results). Search returned 34 results for "ring", suggesting it matches broadly (likely including unrelated products, e.g. general text match rather than strict relevance — worth checking against WooCommerce's default search scope, which searches title/content/excerpt).

---

## 15. Quick View modal

Confirmed present and functional (see Section 10 for full description). Trigger is an eye icon revealed on product-card hover (desktop). Modal contents: image, title, price, short Lorem Ipsum description, quantity stepper, "ADD TO CART" button, "VIEW DETAILS" link, close (×) button. It does not navigate away from the listing page.

---

## 16. Newsletter signup

- No dedicated newsletter form/section with an email input field was found anywhere in the pages audited (homepage, footer, cart, checkout). The closest thing is the top announcement-bar link **"Subscribe to discover"**, but it points to `href="#"` — a placeholder link, not a working signup, and no modal/form appeared when inspecting it in the DOM.
- Checkout has a related opt-in **checkbox** ("I would like to receive exclusive emails with discounts and product information") but that's transactional-list opt-in, not a standalone newsletter block.
- **Conclusion: no functioning newsletter capture currently exists on the site** — this should be designed fresh for the rebuild (e.g. footer signup + exit-intent or homepage section), since nothing here can be "replicated," only inspired by the announcement-bar's intent.

---

## 17. WhatsApp / chat widget

- **Present.** A floating chat button ("Open chat") appears bottom-right, rendered by the **JoinChat** plugin (confirmed via its "Powered by" link: `https://join.chat/en/powered/?site=ladydiamondjewels.com&url=...`). JoinChat is a WordPress plugin that renders a WhatsApp-style floating button that opens a WhatsApp deep link to a configured phone number.
- A second round button next to it is a separate **accessibility toolbar widget** (toggle labeled "Toggle Enable" in the DOM, standard WP accessibility-widget plugin pattern) — not related to chat.
- Could not confirm the exact destination WhatsApp number/link without triggering an outbound click (avoided to stay read-only-safe); in the rebuild, a WhatsApp click-to-chat button (`https://wa.me/<number>`) should replace this plugin.

---

## 18. URL structure patterns (confirmed)

- Products: `/product/<slug>/` (e.g. `/product/circle-necklace/`, `/product/simple-ring/`)
- Product categories: `/product-category/<slug>/` and nested `/product-category/style/<slug>/` (e.g. `/product-category/jewelry/`, `/product-category/style/earrings/`, `/product-category/style/rings/`, `/product-category/style/bracelets/`)
- Shop/archive main entry point in nav = the "Jewelry" category archive, not a generic `/shop/` (no `/shop/` URL was found in the nav; WooCommerce's default `/shop/` base does not appear to be in use — the site uses the "Jewelry" product category page as its de facto shop page)
- Cart: `/cart/` (supports classic `?add-to-cart=<product_id>` GET param to add items)
- Checkout: `/checkout/`
- My Account: `/my-account/`
- Search: `/?s=<query>&post_type=product`
- Blog-style content: `/category/<slug>/` (e.g. `/category/gold/`)
- Static pages: flat slugs, e.g. `/about-us/`, `/contact-us/`
- Affiliate system: flat slugs under root, e.g. `/affiliate-login/`, `/affiliate-area/`, `/affiliate-registration/`, `/affiliate-account/`, `/affiliate-reset-password/`

---

## 19. SEO / meta tags

- **Homepage**: `document.title` = `ladydiamondjewels.com – Our store offers high-quality, elegant fine jewelry—featuring diamonds and precious materials—designed to enhance your everyday style and mark life's special moments.` — i.e., the tagline is being used as the entire page `<title>`, which is unusually long for SEO best practice (recommended ~50-60 chars).
- **No `<meta name="description">` tag found** on either the homepage or the tested product page (Circle Necklace).
- **No Open Graph tags** (`og:title`, `og:description`, `og:image`) found on either page tested.
- **No `<link rel="canonical">` found** on the product page tested.
- Product page `<title>` follows pattern: `<Product Name> – ladydiamondjewels.com` (e.g. `Circle Necklace – ladydiamondjewels.com`).
- **Conclusion: no SEO plugin (Yoast/RankMath) appears to be configured/active**, or if installed, none of its meta output is present. This is a clear gap to fix properly in the Next.js rebuild (per-page metadata, OG images, canonical URLs, sitemap.xml, structured data for Product/Offer schema).

---

## 20. Other distinctive UX patterns / notes

- **Lazy-loaded images** throughout (`loading="lazy"`, `data-lazyloaded` attributes) — homepage hero and category banners did not render their background images during the automated pass, suggesting either slow lazy-load triggers or images tied to scroll-linked animations (common in Qode/Ascella themes, which usually include parallax/fade-in-on-scroll effects for section headings and banner images).
- **Decorative overlay graphics**: thin circular/line-art SVG or CSS overlays are drawn on top of the "SOPHISTICATED" and "BEAUTY BRACELESTS" homepage banner photos — a recurring brand motif worth preserving.
- **Badges**: "New" (ribbon, top-left of product image), "Sale" (with strikethrough price), "Sold" (replaces Add to Cart with "Read More"/disables purchase) — all standard WooCommerce/plugin badges, consistently styled.
- **Per-card action set**: every product card carries three hover icons — Quick View (eye), Wishlist (heart), and what looks like a second "eye" icon — plus a "Compare" text link below the Add to Cart/Select Options button. This 4-action pattern (Quick View / Wishlist / Compare / Add to Cart) is powered by YITH plugins (Wishlist, Compare) alongside the native quick-view — in the rebuild this could be simplified to Quick View + Wishlist + Add to Cart unless Compare is a feature the client actually wants kept.
- **Repeated boilerplate copy**: the same three sub-headings ("SUMMER COLLECTION", "PEARL INTUITION", "SERENITY BLUE SANDSTONE") and the same Lorem Ipsum paragraph appear verbatim on every product's Description tab — confirms this is unedited theme demo content, not real per-SKU copy, and none of it should be treated as final content to port over.
- **Broken/placeholder links spotted**: footer "Shay Pasha" credit link (`href="https://Shay Pasha/"`, malformed), header Wishlist icon pointing to the theme demo's own domain (`ascella.qodeinteractive.com`), announcement-bar "Subscribe to discover" pointing to `#`, "Blog" nav item pointing to a `/category/gold/` archive rather than an actual blog listing, duplicate menu entries (Nouvates Earrings, Spiral Ring each listed twice under their category dropdowns) — all worth cleaning up rather than reproducing in the rebuild.
- Currency is Israeli New Shekel (₪) throughout, and Israel appears prioritized in the checkout country selector — confirms this is a store target-marketed primarily at Israeli customers despite the homepage tagline mentioning "worldwide shipping."

---

## Can be replicated 1:1 from what we observed

- Full information architecture: page list, URL slug patterns (`/product/…`, `/product-category/…`, `/cart/`, `/checkout/`, `/my-account/`), and nav menu item order/labels.
- Header layout (announcement bar → logo/hamburger row), footer skeleton (4-column top + 2-column bottom bar), and the fact that nav is menu/hamburger-driven rather than an inline horizontal bar.
- Homepage section sequence and each section's heading/label copy (Latest Beauty, Sophisticated, Beauty Bracelests, More Categories, New Earrings, New Collection/Elsa Paretty Jewelry, Euphoria, Our Partners, Kind Words, Instagram).
- Product page layout: gallery + title + price + short description + variant dropdown + qty stepper + Add to Cart + Wishlist + Share + SKU/Categories/Tags + Description/Additional Information/Reviews tabs + Related Products.
- Category/listing page layout: breadcrumb, result count, sort dropdown options, card design (image, hover icons, title, category, price, CTA, Compare), badges (New/Sale/Sold), numbered pagination.
- Cart and Checkout field-by-field layout and copy (billing fields, payment method names and their exact instructional copy, order summary structure).
- Quick View modal layout and its exact fields.
- The variant pattern actually used (a single "Colors" attribute: Gold/Silver) as a realistic example to model the variant-selector component on.
- Search results page behaving identically to a category page, with a "Relevance" sort option added.
- The presence/absence pattern of a newsletter form (none) and the broken "Subscribe to discover" link's intent (worth designing a real version of).
- The WhatsApp-style floating chat affordance (JoinChat) and the accessibility-toolbar widget, as UX patterns to reproduce (with real business phone number and real destination).

## Needs original WordPress/WooCommerce access to fully replicate

- Real, final product inventory: complete accurate product list, real photography, real SKUs/pricing, real stock levels, real weights/dimensions, and non-Lorem-Ipsum descriptions — everything seen was placeholder/demo content.
- Exact CSS values: precise color hex codes, font families/weights/sizes, spacing/grid breakpoints, animation timing/easing (only approximate visual impressions were captured via screenshots).
- Backend-only settings: shipping zones/rates configuration, tax rules, the exact payment gateway setup (currently only manual Bank Transfer/COD — real gateway credentials, e.g. a card processor, would need to be sourced from the client), coupon rules, affiliate program commission structure/rules (AffiliateWP or similar plugin settings), and email/notification templates.
- Hero banner and homepage slider actual image assets and copy (did not render/load during the audit — may need direct CMS access or a slower manual pass to capture).
- "Our Partners" logos and "Kind Words" testimonial content (headings were visible but content did not render as text during the automated pass — needs a manual visual pass or WP admin access to pull the real content/images).
- Real Instagram handle and feed content (current handle shown, `@QODEINTERACTIVE`, is the theme vendor's own demo handle, not the client's).
- Exact WhatsApp number/destination behind the JoinChat floating button (not opened, to avoid an outbound action during a read-only audit).
- Any WP-admin-only configuration: user roles, the affiliate program's actual commission/payout rules, whatever plugin currently causes the cart-persistence caching quirk described in Section 11, and whether an SEO plugin is installed but simply unconfigured vs. not installed at all.
