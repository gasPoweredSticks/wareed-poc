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

function serviceCard(s) {
  return `
    <div class="card service-card" data-service="${s.id}">
      <h3>${s.name}</h3>
      <p class="short">${s.short}</p>
      <div class="price">${s.price} <small>ريال</small></div>
      <div class="card-actions">
        <a class="btn btn-primary" href="${serviceUrl(s)}&book=1">حجز</a>
        <a class="btn btn-outline" href="${serviceUrl(s)}">التفاصيل</a>
      </div>
    </div>`;
}

function renderHome() {
  document.title = "مجموعة مختبرات وريد الطبية | تحاليل دقيقة وخدمة منزلية موثوقة";
  app.innerHTML = `
    <div class="hero">
      <div class="container">
        <span class="badge">معتمدون من سباهي ومرخصون من وزارة الصحة</span>
        <h1>مختبرات وريد الطبية</h1>
        <p>فحوصات شاملة لمتابعة صحتك — تحاليل مخبرية دقيقة، رعاية منزلية متكاملة، واستشارات طبية متخصصة. نصلك أينما كنت.</p>
        <a class="btn btn-primary" href="#categories" style="background:#fff;color:var(--primary-dark)">استكشف خدماتنا</a>
      </div>
    </div>

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
              <div class="icon">${c.icon}</div>
              <h3>${c.name}</h3>
              <p>${c.tagline}</p>
            </a>`
          ).join("")}
        </div>
      </div>
    </section>

    ${CATEGORIES.map(
      (c, i) => `
      <section class="${i % 2 === 0 ? "soft" : ""}" id="${c.id}">
        <div class="container">
          <div class="section-head">
            <h2>${c.name}</h2>
            <p>${c.tagline}</p>
          </div>
          <div class="grid grid-3">
            ${servicesOf(c.id).map(serviceCard).join("")}
          </div>
        </div>
      </section>`
    ).join("")}

    <section>
      <div class="container">
        <div class="stats">
          <div class="stat"><h3>10,000,000+</h3><p>تحليل تم إجراؤه في مختبرات وريد</p></div>
          <div class="stat"><h3>700,000+</h3><p>عميل تم خدمته في مختبرات وريد</p></div>
          <div class="stat"><h3>24 ساعة</h3><p>متوسط وقت ظهور النتائج</p></div>
        </div>
      </div>
    </section>

    <section class="soft" id="testimonials">
      <div class="container">
        <div class="section-head"><h2>آراء العملاء</h2></div>
        <div class="grid grid-3">
          ${TESTIMONIALS.map(
            (t) => `<div class="testimonial">"${t}"<div class="who">من عملاء مجموعة وريد</div></div>`
          ).join("")}
        </div>
      </div>
    </section>

    <section id="faq">
      <div class="container" style="max-width:820px">
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
        <button class="btn btn-primary" id="book-btn" data-service="${s.id}">احجز الآن</button>
        <div class="hint">تحدث مع مساعدنا الذكي لإتمام الحجز أو اتصل على 8001221220</div>
      </div>
    </div>`;

  document.getElementById("book-btn").addEventListener("click", () => {
    // The tkana widget handles booking; open it if present, otherwise no-op for now.
    if (window.tkana && typeof window.tkana.open === "function") {
      window.tkana.open({ context: { serviceId: s.id, serviceName: s.name, price: s.price } });
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
        <h2 style="color:var(--primary-dark);margin-bottom:12px">الصفحة غير موجودة</h2>
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
  if (p === page) a.classList.add("active");
});
