# Wareed POC

A proof-of-concept landing page mimicking [wareed.com.sa](https://wareed.com.sa/) (Saudi medical labs group), built to demo the tkana AI widget:

- Customer support with escalations
- FAQs
- Sales agent (cross-sell / upsell)
- Medical router: symptoms → the right consultation or lab test (or both)
- Agent-driven page redirects (the agent sends the user to a deep link and the page opens on it)
- Bookings via the tkana booking module

## Running

Static site — no build step. Serve the root with any static server:

```bash
npx serve .
# or
python3 -m http.server 8080
```

## Structure

- `index.html` — shell (header, nav, footer) + the `TKANA_WIDGET` marker comment where the widget script goes
- `assets/data.js` — the catalog: 4 categories × 3 services, FAQs, testimonials
- `assets/app.js` — tiny query-param router + renderers
- `assets/styles.css` — Wareed-style purple theme (`#95389E` / `#5E3296`), Arabic RTL

## Routes (for agent redirects)

Every page is addressable by URL, so the agent can redirect the user by sending a link (full reload works):

| URL | Page |
|---|---|
| `/` | Home (hero, offers, categories, all services, testimonials, FAQ) |
| `/?page=offers` | أفضل العروض (real Wareed promos) |
| `/?page=packages` | الباقات المتخصصة (specialized packages) |
| `/?page=tests` | التحاليل الفردية (individual tests) |
| `/?page=homecare` | وريد كير — الرعاية المنزلية (home care) |
| `/?page=consultations` | الاستشارات الطبية (consultations) |
| `/?page=service&id=<slug>` | Service detail page |
| `/?page=service&id=<slug>&book=1` | Service detail, scrolled to the booking box |
| `/#faq` | FAQ section on home |

### Service slugs

| Category | Slug | Service | Price (SAR) |
|---|---|---|---|
| offers | `any-test-40` | أي تحليل بـ40 وأي تحليلين بـ60 | 40 |
| offers | `any-4-tests-100` | أي 4 تحاليل بـ100 ريال | 100 |
| offers | `worldcup-basic-11` | عرض كأس العالم — أي 11 تحليل بـ198 | 198 |
| offers | `worldcup-full-26` | عرض كأس العالم — اختر 26 تحليل بـ352 | 352 |
| offers | `summer-comprehensive-448` | باقة الصيف الشاملة + 8 تحاليل مجاناً | 448 |
| offers | `luxury-health-package` | باقة الفخامة الصحية — 120 تحليل | 3999 |
| packages | `thyroid-package` | باقة صحة الغدة الدرقية | 199 |
| packages | `diabetes-package` | باقة فحص السكري | 199 |
| packages | `womens-fertility-package` | باقة خصوبة المرأة | 230 |
| tests | `vitamin-d-test` | تحليل فيتامين د | 40 |
| tests | `vitamin-b12-test` | تحليل فيتامين ب12 | 40 |
| tests | `cbc-test` | تحليل صورة الدم كاملة | 40 |
| homecare | `vitamin-d-injection` | إبر فيتامين د العلاجية | 149 |
| homecare | `b12-injection` | إبر فيتامين B12 بالمنزل | 149 |
| homecare | `iron-infusion` | إبر الحديد المكثف بالمنزل | 599 |
| homecare | `wareed-hadir` | وريد حاضر — سحب العينات من المنزل | 100 |
| consultations | `internal-medicine-consult` | استشارة طب باطني | 199 |
| consultations | `nutrition-consult` | استشارة تغذية علاجية | 149 |
| consultations | `dermatology-consult` | استشارة جلدية | 179 |

Each service in `assets/data.js` also carries a `symptoms` list — the source material for training the medical-router skill (symptom → service mapping).

## Booking hook

The "احجز الآن" button on service pages calls `window.tkana.open({ context: { serviceId, serviceName, price } })` if the widget is present — wire this to the real widget API once the script is added.
