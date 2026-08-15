(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = window.innerWidth < 720;

  /* ============================================================
     NAVBAR — smooth indicator with click-lock & scroll spy
     ============================================================ */
  const navbar = document.getElementById("navbar");
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  const navIndicator = document.getElementById("navIndicator");
  const navAnchors = Array.from(document.querySelectorAll('[data-nav]'));
  let isClickScrolling = false;
  let clickScrollTimer = null;

  function onScroll() {
    if (navbar) navbar.classList.toggle("scrolled", window.scrollY > 40);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      navToggle.classList.toggle("open", open);
      navToggle.setAttribute("aria-expanded", String(open));
    });
  }

  // Linear, direct slide from current position to target
  function updateNavIndicator(targetAnchor) {
    if (!targetAnchor || !navIndicator || !navLinks || window.innerWidth <= 900) {
      if (navIndicator) navIndicator.style.opacity = "0";
      return;
    }

    const containerRect = navLinks.getBoundingClientRect();
    const anchorRect = targetAnchor.getBoundingClientRect();

    const leftOffset = anchorRect.left - containerRect.left;
    const anchorWidth = anchorRect.width;

    navIndicator.style.opacity = "1";
    navIndicator.style.width = `${anchorWidth}px`;
    navIndicator.style.transform = `translateX(${leftOffset}px)`;
  }

  // Click handler: locks ScrollSpy during the scroll so the pill moves straight to the target
  navAnchors.forEach(link => {
    link.addEventListener("click", () => {
      if (navLinks) navLinks.classList.remove("open");
      if (navToggle) {
        navToggle.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }

      // Lock scroll observer updates for 800ms
      isClickScrolling = true;
      clearTimeout(clickScrollTimer);
      clickScrollTimer = setTimeout(() => {
        isClickScrolling = false;
      }, 850);

      navAnchors.forEach(a => a.classList.remove("active"));
      link.classList.add("active");
      updateNavIndicator(link);
    });
  });

  // ScrollSpy observer (ignored when smooth scroll was triggered by click)
  const sections = ["home", "about", "education", "skills", "portfolio", "testimonials", "contact"]
    .map(id => document.getElementById(id)).filter(Boolean);

  const navObserver = new IntersectionObserver((entries) => {
    if (isClickScrolling) return; // Prevent intermediate triggers

    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        const matchingLink = navAnchors.find(a => a.getAttribute("href") === "#" + id);
        if (matchingLink) {
          navAnchors.forEach(a => a.classList.remove("active"));
          matchingLink.classList.add("active");
          updateNavIndicator(matchingLink);
        }
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });

  sections.forEach(s => navObserver.observe(s));

  // Initialize indicator position
  const initialNavActive = document.querySelector('.nav-links a.active') || navAnchors[0];
  if (initialNavActive) {
    setTimeout(() => updateNavIndicator(initialNavActive), 80);
  }

  window.addEventListener('resize', () => {
    const active = document.querySelector('.nav-links a.active');
    if (active) updateNavIndicator(active);
  });

  /* ============================================================
     HERO — exact pixel-width sliding text animation
     ============================================================ */
  const roleEl = document.getElementById("roleText");
  (function slideRoles() {
    if (!roleEl || typeof ROLES === "undefined" || !ROLES.length) return;
    let roleIndex = 0;

    function cycleRole() {
      roleEl.textContent = ROLES[roleIndex];
      roleEl.style.animation = 'none';
      roleEl.style.maxWidth = '0px';

      roleEl.style.maxWidth = 'none';
      const exactWidth = roleEl.scrollWidth;
      roleEl.style.maxWidth = '0px';

      roleEl.style.setProperty('--target-width', exactWidth + 'px');
      void roleEl.offsetWidth;

      roleEl.style.animation = 'slideOpen 0.9s cubic-bezier(0.4, 0, 0.2, 1) forwards';

      setTimeout(() => {
        roleEl.style.animation = 'slideClose 0.9s cubic-bezier(0.4, 0, 0.2, 1) forwards';
      }, 2000);

      roleIndex = (roleIndex + 1) % ROLES.length;
    }

    cycleRole();
    setInterval(cycleRole, 3100);
  })();

  /* ============================================================
     SOCIAL LINKS — hero, contact, footer
     ============================================================ */
  const SOCIAL_ICON_PATHS = {
    linkedin: '<path d="M6 9h3v11H6zM7.5 4.5a1.8 1.8 0 110 3.6 1.8 1.8 0 010-3.6zM12 9h3v1.6c.6-1 1.7-1.8 3.3-1.8 3 0 3.7 1.9 3.7 4.5V20h-3v-6c0-1.4 0-3.2-2-3.2s-2.3 1.5-2.3 3.1V20h-3z"/>',
    github: '<path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>',
    behance: '<path d="M4 8h6.2c1.6 0 2.8.4 3.6 1.1.8.7 1.2 1.6 1.2 2.7 0 1.3-.6 2.3-1.9 2.9 1.6.5 2.4 1.7 2.4 3.3 0 1.2-.4 2.2-1.3 3-.9.7-2.1 1-3.7 1H4V8zm5.6 5.4c.9 0 1.5-.5 1.5-1.4 0-.9-.6-1.3-1.5-1.3H6.7v2.7h2.9zm.3 5.6c1 0 1.7-.5 1.7-1.5s-.7-1.5-1.7-1.5H6.7v3h3.2zM15 9.3h5.6v1.4H15zM20.9 16.6c0-2.9-1.7-4.9-4.5-4.9-2.7 0-4.6 2-4.6 4.8 0 2.9 1.8 4.7 4.7 4.7 1.8 0 3.2-.7 4-2.1l-2-1c-.4.7-1 1.1-1.9 1.1-1.2 0-2-.7-2.2-2h6.5c0-.2 0-.4 0-.6zm-6.4-1.1c.2-1.1 1-1.7 2-1.7 1 0 1.7.6 1.9 1.7z"/>',
    instagram: '<rect x="4.5" y="4.5" width="15" height="15" rx="4.5" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="3.6" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="16.6" cy="7.4" r="1"/>'
  };

  function renderSocial(containerId, size) {
    const container = document.getElementById(containerId);
    if (!container || typeof SOCIAL_LINKS === "undefined") return;
    container.innerHTML = SOCIAL_LINKS.map(s => `
      <a href="${s.url}" aria-label="${s.name}" target="_blank" rel="noopener">
        <svg viewBox="0 0 24 24" width="${size || 18}" height="${size || 18}" fill="currentColor">${SOCIAL_ICON_PATHS[s.icon] || ""}</svg>
      </a>`).join("");
  }
  renderSocial("socialRow", 18);
  renderSocial("contactSocial", 17);

  const footerSocial = document.getElementById("footerSocial");
  if (footerSocial && typeof SOCIAL_LINKS !== "undefined") {
    footerSocial.innerHTML = SOCIAL_LINKS.map(s => `<a href="${s.url}" target="_blank" rel="noopener">${s.name}</a>`).join("");
  }

  /* ============================================================
     ABOUT — skill bars
     ============================================================ */
  const aboutBars = document.getElementById("aboutSkillbars");
  if (aboutBars && typeof ABOUT_SKILLS !== "undefined") {
    aboutBars.innerHTML = ABOUT_SKILLS.map(s => `
      <div class="skillbar-row">
        <div class="skillbar-label"><span>${s.label}</span><span>${s.value}%</span></div>
        <div class="skillbar-track"><div class="skillbar-fill" data-fill="${s.value}"></div></div>
      </div>`).join("");
  }

  /* ============================================================
     EDUCATION — timeline stops
     ============================================================ */
  const eduTimeline = document.getElementById("eduTimeline");
  if (eduTimeline && typeof EDUCATION !== "undefined") {
    eduTimeline.innerHTML = EDUCATION.map(e => `
      <div class="edu-stop">
        <span class="edu-dot"></span>
        <div class="edu-card">
          <p class="edu-period">${e.period}</p>
          <h4 class="edu-degree">${e.degree}</h4>
          <p class="edu-school">${e.school}</p>
        </div>
      </div>`).join("");
  }

  /* ============================================================
     SKILLS SECTION — tabs + cards
     ============================================================ */
  function renderSkillGrid(containerId, list) {
  const el = document.getElementById(containerId);
  if (!el || !list) return;
  
  el.innerHTML = list.map(s => `
    <div class="skill-card">
      ${s.icon ? `
        <div class="skill-icon-wrapper">
          <svg class="skill-circle-svg" viewBox="0 0 76 76">
            <circle class="circle-bg" cx="38" cy="38" r="34"></circle>
            <circle class="circle-progress" cx="38" cy="38" r="34"></circle>
          </svg>
          <div class="skill-icon-img">
            <span class="skill-icon-mask" style="--icon-url: url('${s.icon}');"></span>
          </div>
        </div>
      ` : ""}
      <div class="skill-card-top">
        <h4>${s.name}</h4>
        <span>${s.level}%</span>
      </div>
      <p>${s.note || ""}</p>
      <div class="skillbar-track"><div class="skillbar-fill" data-fill="${s.level}"></div></div>
    </div>`).join("");
}
  renderSkillGrid("programmingGrid", typeof PROGRAMMING_SKILLS !== "undefined" ? PROGRAMMING_SKILLS : []);
  renderSkillGrid("softwareGrid", typeof SOFTWARE_SKILLS !== "undefined" ? SOFTWARE_SKILLS : []);

  const tabsContainer = document.querySelector('.skills-tabs');
  const indicator = document.getElementById('skillsIndicator');
  const tabs = document.querySelectorAll('.skills-tab');

  function updateIndicator(targetTab, animateFluid = true) {
    if (!targetTab || !indicator || !tabsContainer) return;

    const containerRect = tabsContainer.getBoundingClientRect();
    const tabRect = targetTab.getBoundingClientRect();

    const leftOffset = tabRect.left - containerRect.left;
    const tabWidth = tabRect.width;

    if (animateFluid) {
      indicator.style.width = `${tabWidth * 1.25}px`;
    } else {
      indicator.style.width = `${tabWidth}px`;
    }

    indicator.style.transform = `translateX(${leftOffset}px)`;

    setTimeout(() => {
      indicator.style.width = `${tabWidth}px`;
    }, 180);
  }

  const initialActive = document.querySelector('.skills-tab.active');
  if (initialActive) {
    setTimeout(() => updateIndicator(initialActive, false), 50);
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => { 
        t.classList.remove('active'); 
        t.setAttribute('aria-selected', 'false'); 
      });

      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      updateIndicator(tab, true);

      // Reset animation state
      document.querySelectorAll('.skills-panel').forEach(p => {
        p.classList.remove('active');
        p.classList.remove('is-visible');
      });

      const panel = document.getElementById('panel-' + tab.dataset.tab);
      if (panel) {
        panel.classList.add('active');
        // Re-trigger entrance animation
        requestAnimationFrame(() => {
          panel.classList.add('is-visible');
          if (typeof fillBar === 'function') {
            panel.querySelectorAll('.skillbar-fill').forEach(fillBar);
          }
        });
      }
    });
  });

  window.addEventListener('resize', () => {
    const activeTab = document.querySelector('.skills-tab.active');
    if (activeTab) updateIndicator(activeTab, false);
  });

  /* ============================================================
     PORTFOLIO — cards + interactive modal
     ============================================================ */
  const FILTERS = [
    { key: "all", label: "All" },
    { key: "certificate", label: "Certificate" },
    { key: "award", label: "Award" },
    { key: "scholarship", label: "Scholarship" },
    { key: "project", label: "Project" }
  ];

  const filterRow = document.getElementById("filterRow");
  const portfolioGrid = document.getElementById("portfolioGrid");
  const pModal = document.getElementById("portfolioModal");
  const modalContent = document.querySelector(".p-modal-content");
  const modalBody = document.getElementById("modalBody");
  const modalClose = document.getElementById("modalClose");
  let activeButton = null;

  function renderPortfolio() {
  if (!portfolioGrid || typeof PORTFOLIO_ITEMS === "undefined") return;
  portfolioGrid.innerHTML = PORTFOLIO_ITEMS.map((item, index) => `
    <div class="p-card" data-cat="${item.category}">
      <div class="p-thumb">
        <img src="${item.image}" alt="${item.title}" loading="lazy">
        <span class="p-cat">${item.category}</span>
      </div>
      <div class="p-body">
        <h4>${item.title}</h4>
        <button type="button" class="p-link" data-index="${index}">
          View details
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M9 7h8v8"/></svg>
        </button>
      </div>
    </div>`).join("");
}
  renderPortfolio();

  function openModal(index, clickedBtn) {
    if (typeof PORTFOLIO_ITEMS === "undefined") return;
    const item = PORTFOLIO_ITEMS[index];
    if (!item || !modalBody || !pModal || !modalContent) return;

    activeButton = clickedBtn;
    if (activeButton) activeButton.classList.add("button-hidden");

    if (clickedBtn) {
      const btnRect = clickedBtn.getBoundingClientRect();
      const targetCenterX = window.innerWidth / 2;
      const targetCenterY = window.innerHeight / 2;

      const btnCenterX = btnRect.left + btnRect.width / 2;
      const btnCenterY = btnRect.top + btnRect.height / 2;

      const deltaX = btnCenterX - targetCenterX;
      const deltaY = btnCenterY - targetCenterY;

      modalContent.style.setProperty("--origin-x", `${deltaX}px`);
      modalContent.style.setProperty("--origin-y", `${deltaY}px`);
    }

    modalBody.innerHTML = `
      <span class="p-modal-cat">${item.category}</span>
      <h3>${item.title}</h3>
      <p>${item.description || "No description provided."}</p>
      ${item.link && item.link !== '#' ? `<a href="${item.link}" target="_blank" rel="noopener" class="btn btn-primary btn-sm">Visit Project</a>` : ''}
    `;

    requestAnimationFrame(() => {
      pModal.classList.add("open");
      document.body.style.overflow = "hidden";
    });
  }

  function closeModal() {
    if (!pModal) return;
    pModal.classList.remove("open");
    document.body.style.overflow = "";

    if (activeButton) {
      activeButton.classList.remove("button-hidden");
      activeButton = null;
    }
  }

  if (portfolioGrid) {
    portfolioGrid.addEventListener("click", (e) => {
      const btn = e.target.closest(".p-link");
      if (!btn) return;
      e.preventDefault();
      const index = Number(btn.getAttribute("data-index"));
      openModal(index, btn);
    });
  }

  if (modalClose) {
    modalClose.addEventListener("click", (e) => {
      e.preventDefault();
      closeModal();
    });
  }

  if (pModal) {
    pModal.addEventListener("click", (e) => {
      if (e.target === pModal) closeModal();
    });
  }

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  if (filterRow) {
    filterRow.innerHTML = `
      <span class="portfolio-indicator" id="portfolioIndicator"></span>
      ${FILTERS.map((f, i) =>
        `<button type="button" class="filter-btn${i === 0 ? " active" : ""}" data-filter="${f.key}">${f.label}</button>`
      ).join("")}
    `;
  }

  const portIndicator = document.getElementById("portfolioIndicator");

  function updatePortfolioIndicator(targetBtn, animateFluid = true) {
    if (!targetBtn || !portIndicator || !filterRow) return;

    const rowRect = filterRow.getBoundingClientRect();
    const btnRect = targetBtn.getBoundingClientRect();

    const leftOffset = btnRect.left - rowRect.left;
    const topOffset = btnRect.top - rowRect.top;
    const btnWidth = btnRect.width;

    portIndicator.style.opacity = "1";
    portIndicator.style.top = `${topOffset}px`;
    portIndicator.style.height = `${btnRect.height}px`;

    if (animateFluid) {
      portIndicator.style.width = `${btnWidth * 1.2}px`;
    } else {
      portIndicator.style.width = `${btnWidth}px`;
    }

    portIndicator.style.transform = `translateX(${leftOffset}px)`;

    setTimeout(() => {
      portIndicator.style.width = `${btnWidth}px`;
    }, 180);
  }

  if (filterRow) {
    filterRow.addEventListener("click", (e) => {
      const btn = e.target.closest(".filter-btn");
      if (!btn) return;

      filterRow.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      updatePortfolioIndicator(btn, true);

      const key = btn.dataset.filter;
      
      // Temporarily remove visibility class to reset animation
      portfolioGrid.classList.remove("is-visible");

      document.querySelectorAll(".p-card").forEach(card => {
        const match = key === "all" || card.dataset.cat === key;
        card.classList.toggle("hide", !match);
      });

      // Re-trigger the pop-in entrance animation
      requestAnimationFrame(() => {
        portfolioGrid.classList.add("is-visible");
      });
    });
  }

  const initialFilterActive = document.querySelector(".filter-btn.active");
  if (initialFilterActive) {
    setTimeout(() => updatePortfolioIndicator(initialFilterActive, false), 80);
  }

  window.addEventListener("resize", () => {
    const active = document.querySelector(".filter-btn.active");
    if (active) updatePortfolioIndicator(active, false);
  });

  /* ============================================================
     TESTIMONIALS — slider
     ============================================================ */
  const track = document.getElementById("testimonialTrack");
  const dotsWrap = document.getElementById("testimonialDots");
  let tIndex = 0, tTimer;

  function initials(name) {
    return name.split(" ").map(n => n[0]).slice(0, 2).join("");
  }

  function renderTestimonials() {
    if (!track || typeof TESTIMONIALS === "undefined") return;
    track.innerHTML = TESTIMONIALS.map((t, i) => `
      <div class="t-slide${i === 0 ? " active" : ""}" data-i="${i}">
        <div class="t-avatar">${initials(t.name)}</div>
        <p class="t-quote">"${t.quote}"</p>
        <p class="t-name">${t.name}</p>
        <p class="t-role">${t.role}</p>
      </div>`).join("");

    if (dotsWrap) {
      dotsWrap.innerHTML = TESTIMONIALS.map((_, i) =>
        `<button class="t-dot${i === 0 ? " active" : ""}" data-i="${i}" aria-label="Testimonial ${i + 1}"></button>`
      ).join("");
    }
  }
  renderTestimonials();

  function goToTestimonial(i) {
    if (typeof TESTIMONIALS === "undefined" || !track || !dotsWrap) return;
    tIndex = (i + TESTIMONIALS.length) % TESTIMONIALS.length;
    track.querySelectorAll(".t-slide").forEach(s => s.classList.toggle("active", Number(s.dataset.i) === tIndex));
    dotsWrap.querySelectorAll(".t-dot").forEach(d => d.classList.toggle("active", Number(d.dataset.i) === tIndex));
  }

  if (dotsWrap) {
    dotsWrap.addEventListener("click", (e) => {
      const dot = e.target.closest(".t-dot");
      if (!dot) return;
      goToTestimonial(Number(dot.dataset.i));
      resetAutoplay();
    });
  }

  function resetAutoplay() {
    clearInterval(tTimer);
    if (prefersReducedMotion) return;
    tTimer = setInterval(() => goToTestimonial(tIndex + 1), 6000);
  }
  resetAutoplay();

  /* ============================================================
     STATS — animated counters
     ============================================================ */
  const statsGrid = document.getElementById("statsGrid");
  if (statsGrid && typeof STATS !== "undefined") {
    statsGrid.innerHTML = STATS.map(s => `
      <div>
        <div class="stat-num" data-count="${s.value}" data-suffix="${s.suffix || ""}">0${s.suffix || ""}</div>
        <div class="stat-label">${s.label}</div>
      </div>`).join("");
  }

  function animateCount(el) {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    if (prefersReducedMotion) { el.textContent = target + suffix; return; }
    const duration = 1400;
    const start = performance.now();
    function step(now) {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const statsObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll(".stat-num").forEach(animateCount);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  const statsSection = document.getElementById("stats");
  if (statsSection) statsObserver.observe(statsSection);

  /* ============================================================
     CONTACT INFO + form
     ============================================================ */
  if (typeof CONTACT_INFO !== "undefined") {
    const emailEl = document.getElementById("contactEmail");
    const locEl = document.getElementById("contactLocation");
    if (emailEl) emailEl.textContent = CONTACT_INFO.email;
    if (locEl) locEl.textContent = CONTACT_INFO.location;
  }

  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const note = document.getElementById("formNote");
      if (note) note.textContent = "Thanks — your message is ready to send once this form is connected to an email service.";
      contactForm.reset();
    });
  }

  /* ============================================================
     SCROLL REVEAL (Makes all sections visible)
     ============================================================ */
  function fillBar(bar) {
    const val = bar.dataset.fill;
    if (val) requestAnimationFrame(() => { bar.style.width = val + "%"; });
  }

  const revealTargets = document.querySelectorAll("[data-reveal], [data-reveal-stagger]");
  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        entry.target.querySelectorAll(".skillbar-fill").forEach(fillBar);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  revealTargets.forEach(t => revealObserver.observe(t));

  document.querySelectorAll(".skills-panel.active .skillbar-fill").forEach(fillBar);

  /* ============================================================
     FOOTER YEAR
     ============================================================ */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();

/* ============================================================
   INTERACTIVE VECTOR-PATH FLOATING BACKGROUND ENGINE
   ============================================================ */
(function initVectorFloatingElements() {
  const canvas = document.getElementById('heroField');
  if (!canvas) return;

  let ctx;
  if (canvas.tagName && canvas.tagName.toLowerCase() === 'canvas') {
    ctx = canvas.getContext('2d');
  } else {
    const c = document.createElement('canvas');
    c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
    canvas.appendChild(c);
    ctx = c.getContext('2d');
  }

  let width, height;
  let particles = [];

  const mouse = { x: -9999, y: -9999, radius: 120 };

  const parentEl = canvas.parentElement || window;
  parentEl.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  parentEl.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  const DRAW_FUNCTIONS = [
    (ctx) => { ctx.font = 'bold 16px monospace'; ctx.fillText('{ }', -10, 5); },
    (ctx) => { ctx.font = 'bold 14px monospace'; ctx.fillText('</>', -12, 4); },
    (ctx) => { ctx.font = '12px monospace'; ctx.fillText('10', -6, 4); },
    (ctx) => {
      ctx.beginPath();
      ctx.moveTo(-10, 10); ctx.lineTo(-6, -10); ctx.lineTo(-2, -10); ctx.lineTo(-10, 10);
      ctx.moveTo(-6, -10); ctx.lineTo(8, 4); ctx.lineTo(4, 8); ctx.lineTo(-10, 10);
      ctx.stroke();
    },
    (ctx) => {
      ctx.beginPath();
      ctx.moveTo(0, -12); ctx.lineTo(8, 2); ctx.lineTo(4, 10); ctx.lineTo(-4, 10); ctx.lineTo(-8, 2); ctx.closePath();
      ctx.moveTo(0, -12); ctx.lineTo(0, 2);
      ctx.stroke();
    },
    (ctx) => {
      ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(-4, -3, 1.8, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(4, -3, 1.8, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(0, 4, 1.8, 0, Math.PI * 2); ctx.fill();
    },
    (ctx) => {
      ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(0, 0, 14, 4, Math.PI / 6, 0, Math.PI * 2); ctx.stroke();
    },
    (ctx) => {
      ctx.beginPath();
      ctx.moveTo(0, -12); ctx.quadraticCurveTo(0, 0, 12, 0);
      ctx.quadraticCurveTo(0, 0, 0, 12); ctx.quadraticCurveTo(0, 0, -12, 0);
      ctx.quadraticCurveTo(0, 0, 0, -12);
      ctx.fill();
    },
    (ctx) => {
      ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(7, -7, 2.5, 0, Math.PI * 2); ctx.fill();
    },
    (ctx) => {
      ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(0, 0, 12, 4, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(0, 0, 12, 4, Math.PI / 3, 0, Math.PI * 2); ctx.stroke();
    }
  ];

  function resize() {
    const parent = ctx.canvas.parentElement;
    if (!parent) return;
    width = ctx.canvas.width = parent.offsetWidth;
    height = ctx.canvas.height = parent.offsetHeight;
    createParticles();
  }

  class VectorParticle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.drawFn = DRAW_FUNCTIONS[Math.floor(Math.random() * DRAW_FUNCTIONS.length)];
      this.depth = Math.random() * 0.75 + 0.25; 
      this.scale = this.depth * (width < 768 ? 1.5 : 2.2);

      this.x = initial ? Math.random() * width : -40;
      this.y = (height / 2) + (Math.random() * (height / 2));

      this.baseVx = (0.35 + this.depth * 0.65) * (width < 768 ? 0.7 : 1);
      this.baseVy = (Math.random() - 0.5) * 0.15;
      
      this.vx = this.baseVx;
      this.vy = this.baseVy;

      this.opacity = 0.12 + this.depth * 0.28;
      this.rotation = Math.random() * Math.PI * 2;
      this.vRot = (Math.random() - 0.5) * 0.008;
      
      const colors = ['255, 255, 255', '231, 169, 76', '111, 215, 197'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.hypot(dx, dy);

      if (dist < mouse.radius) {
        const force = (mouse.radius - dist) / mouse.radius;
        const angle = Math.atan2(dy, dx);
        this.vx += Math.cos(angle) * force * 1.5;
        this.vy += Math.sin(angle) * force * 1.5;
      }

      this.vx += (this.baseVx - this.vx) * 0.05;
      this.vy += (this.baseVy - this.vy) * 0.05;

      this.x += this.vx;
      this.y += this.vy;
      this.rotation += this.vRot;

      if (this.x > width + 50) {
        this.reset(false);
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.scale(this.scale, this.scale);

      ctx.strokeStyle = `rgba(${this.color}, ${this.opacity})`;
      ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
      ctx.lineWidth = 2.0;

      this.drawFn(ctx);

      ctx.restore();
    }
  }

  function createParticles() {
    particles = [];
    const density = width < 768 ? 24000 : 16000;
    const count = Math.floor((width * (height / 2)) / density);
    for (let i = 0; i < count; i++) {
      particles.push(new VectorParticle());
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', resize);
  resize();
  animate();
})();

/* ============================================================
   MOBILE DESKTOP NOTICE POPUP LOGIC
   ============================================================ */
(function handleMobileNotice() {
  const modal = document.getElementById("mobileNoticeModal");
  const closeBtn = document.getElementById("mobileNoticeClose");
  const dismissBtn = document.getElementById("mobileNoticeDismiss");

  if (!modal) return;

  // Detect mobile device user agents and touch-screen viewports
  const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (window.innerWidth <= 768 && ('ontouchstart' in window || navigator.maxTouchPoints > 0));

  function showModal() {
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  }

  function hideModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    sessionStorage.setItem("mobileNoticeDismissed", "true");
  }

  if (isMobileDevice && !sessionStorage.getItem("mobileNoticeDismissed")) {
    setTimeout(showModal, 600);
  }

  if (closeBtn) closeBtn.addEventListener("click", hideModal);
  if (dismissBtn) dismissBtn.addEventListener("click", hideModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) hideModal();
  });
})();