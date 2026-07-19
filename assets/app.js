// Wareed POC — tiny URL-driven router.
// Routes (all reload-friendly so the AI agent can redirect by URL):
//   /                                  → home
//   /?page=packages|tests|homecare|consultations  → category page
//   /?page=service&id=<slug>           → service detail page
//   Append &book=1 to a service URL to auto-focus booking.

const params = new URLSearchParams(location.search);
const page = params.get("page") || "home";
const app = document.getElementById("app");

const catById = (id) => CATEGORIES.find((c) => c.id === id);
const servicesOf = (catId) => SERVICES.filter((s) => s.category === catId);

const serviceUrl = (s) => `/?page=service&id=${s.id}`;
const categoryUrl = (c) => `/?page=${c.id}`;

// Line icons per category (stroke-based, inherit styling from CSS)
const ICONS = {
  offers: `<path d="M3 12l9-9h6a3 3 0 0 1 3 3v6l-9 9-9-9z"/><circle cx="16" cy="8" r="1.6"/>`,
  packages: `<path d="M9 3h6v3.5l4.2 8.4A4 4 0 0 1 15.6 21H8.4a4 4 0 0 1-3.6-6.1L9 6.5V3z"/><path d="M7.5 14h9"/><path d="M9 3h6"/>`,
  tests: `<circle cx="10" cy="10" r="6"/><path d="M14.5 14.5 21 21"/><path d="M7.5 10h5M10 7.5v5"/>`,
  homecare: `<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path d="M12 11v6M9 14h6"/>`,
  consultations: `<path d="M5 3v5a5 5 0 0 0 10 0V3"/><path d="M10 13v3a4 4 0 0 0 8 0v-1"/><circle cx="18" cy="12" r="2.5"/>`,
};

const svgIcon = (catId, cls) =>
  `<svg class="${cls}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">${ICONS[catId]}</svg>`;

const arrowIcon = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1.7 5.3 3.3 3.3a1 1 0 0 1 0 1.4l-3.3 3.3-1.4-1.4 1.6-1.6H7v-2h6.9l-1.6-1.6 1.4-1.4z" transform="scale(-1,1) translate(-24,0)"/></svg>`;

function serviceCard(s) {
  // Real Wareed card art everywhere. Offers bake name+price into the image;
  // services show name + price below the image like the wareed listings.
  const head = s.img
    ? `<a href="${serviceUrl(s)}"><img class="offer-img" src="${s.img}" alt="${s.name}" loading="lazy" /></a>`
    : `<div class="panel">
        <img class="watermark" src="/assets/img/logo-mark.svg" alt="" />
        <span class="price-tag">${s.price} ريال</span>
        ${svgIcon(s.category, "service-icon")}
        <h3>${s.name}</h3>
      </div>`;
  const meta =
    s.category === "offers"
      ? ""
      : s.img
        ? `<h3 class="card-title">${s.name}</h3><div class="card-price">${s.price} ريال</div>`
        : `<p class="short">${s.short}</p>`;
  return `
    <div class="card service-card" data-service="${s.id}">
      ${head}
      <div class="body">
        ${meta}
        <div class="card-actions">
          <a class="btn btn-primary" href="${serviceUrl(s)}&book=1">حجز</a>
          <a class="btn btn-outline" href="${serviceUrl(s)}">تفاصيل الباقة</a>
        </div>
      </div>
    </div>`;
}

function renderHome() {
  document.title = "مجموعة مختبرات وريد الطبية | تحاليل دقيقة وخدمة منزلية موثوقة";
  app.innerHTML = `
    <div class="hero-wrap">
      <div class="container">
        <div class="hero-carousel" id="hero-carousel">
          <a class="slide active" href="/?page=packages"><img src="/assets/img/hero-1.webp" alt="عروض مختبرات وريد" /></a>
          <a class="slide" href="/?page=tests"><img src="/assets/img/hero-2.webp" alt="مختبرات وريد" /></a>
        </div>
        <div class="hero-dots" id="hero-dots"></div>
      </div>
    </div>

    <section class="soft" style="padding-top:32px">
      <div class="container">
        <div class="about-grid">
          <div class="about-card">
            <div class="logo-box"><img src="/assets/img/logo-mark.svg" alt="مختبرات وريد الطبية" /></div>
            <div class="about-text">
              <h2>مختبرات وريد الطبية</h2>
              <p>تقدّم مختبرات وريد الطبية فحوصات شاملة لمتابعة صحتك، أفضل مختبر طبي حاصل على شهادة "سباهي" نقدّم خدمات وتحاليل تدعم رحلتك الصحية</p>
              <a class="link-arrow" href="/?page=packages">وريـد لاب ${arrowIcon}</a>
            </div>
          </div>
          <div class="about-card">
            <div class="logo-box"><img src="/assets/img/logo-care.webp" alt="وريد للرعاية المنزلية" /></div>
            <div class="about-text">
              <h2>وريد للرعاية المنزلية</h2>
              <p>مجموعة خدمات وباقات طبية متنوعة من وريد للرعاية المنزلية</p>
              <a class="link-arrow" href="/?page=homecare">وريـد كـير ${arrowIcon}</a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="offers" style="padding-top:8px">
      <div class="container">
        <div class="section-head">
          <h2>أفضل عروض مختبرات وريد</h2>
          <p>عروض قربت تنتهي — احجز قبل نفاد المدة</p>
        </div>
        <div class="grid grid-3">
          ${servicesOf("offers").map(serviceCard).join("")}
        </div>
        <div class="section-cta">
          <a class="btn btn-pill" href="/?page=offers">عرض الكل ${arrowIcon}</a>
        </div>
      </div>
    </section>

    <section id="categories">
      <div class="container">
        <div class="section-head">
          <h2>خدماتنا</h2>
          <p>اختر الفئة المناسبة لاحتياجك الصحي</p>
        </div>
        <div class="grid grid-4">
          ${CATEGORIES.map(
            (c) => `
            <a class="card category-card" href="${categoryUrl(c)}">
              <div class="icon-circle">${svgIcon(c.id, "")}</div>
              <h3>${c.name}</h3>
              <p>${c.tagline}</p>
            </a>`
          ).join("")}
        </div>
      </div>
    </section>

    ${CATEGORIES.filter((c) => c.id !== "offers").map(
      (c, i) => `
      <section class="${i % 2 === 1 ? "soft" : ""}" id="${c.id}">
        <div class="container">
          <div class="section-head">
            <h2>${c.name}</h2>
            <p>${c.tagline}</p>
          </div>
          <div class="grid grid-3">
            ${servicesOf(c.id).map(serviceCard).join("")}
          </div>
          <div class="section-cta">
            <a class="btn btn-pill" href="${categoryUrl(c)}">عرض الكل ${arrowIcon}</a>
          </div>
        </div>
      </section>`
    ).join("")}

    <section>
      <div class="container">
        <div class="section-head"><h2>إحصائيات المختبر</h2></div>
        <div class="stats">
          <div class="stat"><h3>10,000,000</h3><p>تحليل تم إجرائه في مختبرات وريد</p></div>
          <div class="stat"><h3>700,000</h3><p>عميل تم خدمته في مختبرات وريد</p></div>
          <div class="stat"><h3>60+</h3><p>فرعاً حول المملكة</p></div>
        </div>
      </div>
    </section>

    <section class="soft" id="testimonials">
      <div class="container">
        <div class="section-head"><h2>اراء العملاء</h2></div>
        <div class="grid grid-3">
          ${TESTIMONIALS.map(
            (t) => `
            <div class="testimonial">
              <div class="who">من عملاء مجموعة وريد</div>
              ${t}
            </div>`
          ).join("")}
        </div>
      </div>
    </section>

    <section id="partners">
      <div class="container">
        <div class="section-head"><h2>شركاء مجموعة مختبرات وريد الطبية</h2></div>
        <div class="partners-grid">
          ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
            .map((n) => `<div class="partner"><img src="/assets/img/partners/p${n}.svg" alt="شريك" loading="lazy" /></div>`)
            .join("")}
        </div>
      </div>
    </section>

    <section class="soft" id="branches">
      <div class="container">
        <div class="section-head">
          <h2>اكتشف فروع مختبرات وريد الطبية القريبة منك</h2>
          <p>نخدمك في فروعنا وفي منزلك في مختلف مناطق المملكة</p>
        </div>
        <div class="map-card"><img src="/assets/img/map.webp" alt="خريطة فروع وريد" /></div>
      </div>
    </section>

    <section id="faq">
      <div class="container" style="max-width:840px">
        <div class="section-head"><h2>الأسئلة الشائعة</h2></div>
        ${FAQS.map(
          (f) => `
          <details class="faq-item">
            <summary>${f.q}</summary>
            <div class="answer">${f.a}</div>
          </details>`
        ).join("")}
      </div>
    </section>`;

  // Hero carousel
  const slides = [...document.querySelectorAll("#hero-carousel .slide")];
  const dotsWrap = document.getElementById("hero-dots");
  let current = 0;
  slides.forEach((_, i) => {
    const b = document.createElement("button");
    if (i === 0) b.classList.add("active");
    b.addEventListener("click", () => show(i));
    dotsWrap.appendChild(b);
  });
  const dots = [...dotsWrap.children];
  function show(i) {
    slides[current].classList.remove("active");
    dots[current].classList.remove("active");
    current = i;
    slides[current].classList.add("active");
    dots[current].classList.add("active");
  }
  setInterval(() => show((current + 1) % slides.length), 5000);
}

function renderCategory(catId) {
  const cat = catById(catId);
  if (!cat) return renderNotFound();
  document.title = `${cat.name} | مختبرات وريد الطبية`;
  app.innerHTML = `
    <div class="page-hero">
      <div class="container">
        <h1>${cat.name}</h1>
        <p>${cat.tagline}</p>
      </div>
    </div>
    <section>
      <div class="container">
        <div class="grid grid-3">
          ${servicesOf(cat.id).map(serviceCard).join("")}
        </div>
      </div>
    </section>`;
}

function renderService(id) {
  const s = SERVICES.find((x) => x.id === id);
  if (!s) return renderNotFound();
  const cat = catById(s.category);
  document.title = `${s.name} | مختبرات وريد الطبية`;
  app.innerHTML = `
    <div class="container breadcrumb">
      <a href="/">الرئيسية</a> ← <a href="${categoryUrl(cat)}">${cat.name}</a> ← ${s.name}
    </div>
    <div class="container detail">
      <div>
        ${s.img ? `<img class="detail-img" src="${s.img}" alt="${s.name}" />` : ""}
        <h1>${s.name}</h1>
        <p class="desc">${s.description}</p>
        <h3>تشمل الخدمة</h3>
        <ul>${s.includes.map((i) => `<li>${i}</li>`).join("")}</ul>
        <h3>مناسبة لمن يعاني من</h3>
        <div class="chips">${s.symptoms.map((x) => `<span class="chip">${x}</span>`).join("")}</div>
      </div>
      <div class="booking-box" id="booking">
        <div class="price">${s.price} <small>ريال</small></div>
        <div class="duration">${s.duration}</div>
        <button class="btn btn-primary" id="book-btn" data-service="${s.id}">حجز</button>
        <a class="btn btn-outline" href="${categoryUrl(cat)}">تفاصيل الباقة</a>
        <div class="hint">تحدث مع مساعدنا الذكي لإتمام الحجز أو اتصل على 8001221220</div>
      </div>
    </div>`;

  document.getElementById("book-btn").addEventListener("click", () => {
    // Booking happens through the tkana chat widget
    if (typeof window.tkanaChatWidget !== "undefined" && typeof window.tkanaChatWidget.open === "function") {
      window.tkanaChatWidget.open();
    } else {
      alert("سيتم تفعيل الحجز عبر المساعد الذكي قريباً");
    }
  });

  if (params.get("book") === "1") {
    document.getElementById("booking").scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function renderNotFound() {
  document.title = "الصفحة غير موجودة | مختبرات وريد الطبية";
  app.innerHTML = `
    <section style="text-align:center">
      <div class="container">
        <h2 style="color:var(--primary-dark);margin-bottom:14px">الصفحة غير موجودة</h2>
        <a class="btn btn-primary" href="/">العودة للرئيسية</a>
      </div>
    </section>`;
}

// Router
if (page === "home") renderHome();
else if (page === "service") renderService(params.get("id"));
else renderCategory(page);

// Highlight active nav link
document.querySelectorAll("nav.main-nav a").forEach((a) => {
  const target = new URL(a.href, location.origin);
  const p = new URLSearchParams(target.search).get("page") || "home";
  if (p === page && !target.hash) a.classList.add("active");
});
