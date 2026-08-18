(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = window.innerWidth < 720;

/* ============================================================
     NAVBAR — smooth indicator with liquid drag, release momentum & click-lock
     ============================================================ */
  const navbar = document.getElementById("navbar");
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  const navIndicator = document.getElementById("navIndicator");
  const navAnchors = Array.from(document.querySelectorAll('[data-nav]'));

  let isClickScrolling = false;
  let clickScrollTimer = null;
  let isPointerDown = false;
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let initialLeft = 0;
  let initialTop = 0;
  let initialWidth = 0;
  let initialHeight = 0;
  let currentTargetAnchor = null;
  let dragThresholdPassed = false;
  let dragDirection = 0;

  function onScroll() {
    if (navbar) navbar.classList.toggle("scrolled", window.scrollY > 40);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // 1. Mobile Menu Open & Close
  function openMobileNav() {
    if (!navToggle || !navLinks) return;

    const toggleRect = navToggle.getBoundingClientRect();
    const toggleCenterX = toggleRect.left + toggleRect.width / 2;
    const toggleCenterY = toggleRect.top + toggleRect.height / 2;

    const navCenterX = window.innerWidth / 2;
    const navCenterY = 74 + (navLinks.offsetHeight || 300) / 2;

    const deltaX = toggleCenterX - navCenterX;
    const deltaY = toggleCenterY - navCenterY;

    navLinks.style.setProperty("--origin-x", `${deltaX}px`);
    navLinks.style.setProperty("--origin-y", `${deltaY}px`);
    navLinks.style.setProperty("--origin-scale", `0.18`);

    navToggle.classList.add("button-hidden");
    navToggle.setAttribute("aria-expanded", "true");

    requestAnimationFrame(() => {
      navLinks.classList.add("open");
      const activeLink = document.querySelector('.nav-links a.active') || navAnchors[0];
      if (activeLink) {
        setTimeout(() => updateNavIndicator(activeLink, false), 80);
      }
    });
  }

  function closeMobileNav() {
    if (!navLinks) return;
    navLinks.classList.remove("open");

    setTimeout(() => {
      if (navToggle) {
        navToggle.classList.remove("button-hidden");
        navToggle.setAttribute("aria-expanded", "false");
      }
    }, 200);
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      if (navLinks.classList.contains("open")) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });

    document.addEventListener("click", (e) => {
      if (
        window.innerWidth <= 900 &&
        navLinks.classList.contains("open") &&
        !navLinks.contains(e.target) &&
        !navToggle.contains(e.target)
      ) {
        closeMobileNav();
      }
    });
  }

  navAnchors.forEach(a => {
    a.setAttribute("draggable", "false");
    a.addEventListener("dragstart", (e) => e.preventDefault());
  });

  // Relative geometry helper (accurate for both desktop & mobile)
  function getAnchorOffsets(anchor) {
  if (!anchor || !navLinks) return { left: 0, top: 0, width: 0, height: 0 };
  const isMobile = window.innerWidth <= 900;
  
  if (isMobile) {
    const li = anchor.parentElement;
    return {
      left: li.offsetLeft,
      top: li.offsetTop,
      width: li.offsetWidth,
      height: li.offsetHeight
    };
  }

  // Desktop: anchor's li is the direct child of navLinks
  const li = anchor.closest('li') || anchor;
  return {
    left: li.offsetLeft + anchor.offsetLeft,
    top: li.offsetTop + anchor.offsetTop,
    width: anchor.offsetWidth,
    height: anchor.offsetHeight
  };
}

let glassTimer = null;

function updateNavIndicator(targetAnchor, animateFluid = true) {
  if (!targetAnchor || !navIndicator || !navLinks) return;

  const { left, top, width, height } = getAnchorOffsets(targetAnchor);
  navIndicator.style.opacity = "1";

  if (animateFluid) {
    navIndicator.classList.add("is-dragging");
    clearTimeout(glassTimer);
    glassTimer = setTimeout(() => navIndicator.classList.remove("is-dragging"), 450);
  }

  // Smooth direct slide to target coordinates in one step
  navIndicator.style.transform = `translate(${left}px, ${top}px)`;
  navIndicator.style.width = `${width}px`;
  navIndicator.style.height = `${height}px`;
}

  // 3. Momentum overshoot on Drag Release + Drop Landing
  function releaseWithForwardOvershoot(targetAnchor, direction) {
    if (!targetAnchor || !navIndicator || !navLinks) return;

    const isMobile = window.innerWidth <= 900;
    const { left, top, width, height } = getAnchorOffsets(targetAnchor);
    const stretchAmount = isMobile ? 18 : 26;

    navIndicator.style.transition = `
      transform 0.26s cubic-bezier(0.25, 1, 0.5, 1),
      width 0.26s cubic-bezier(0.25, 1, 0.5, 1),
      height 0.26s cubic-bezier(0.25, 1, 0.5, 1),
      opacity 0.3s var(--ease)
    `;

    if (isMobile) {
      const expandedHeight = height + stretchAmount;
      if (direction > 0) {
        navIndicator.style.transform = `translate(${left}px, ${top}px) scale(1.03, 1.03)`;
        navIndicator.style.height = `${expandedHeight}px`;
      } else if (direction < 0) {
        navIndicator.style.transform = `translate(${left}px, ${top - stretchAmount}px) scale(1.03, 1.03)`;
        navIndicator.style.height = `${expandedHeight}px`;
      } else {
        navIndicator.style.transform = `translate(${left}px, ${top}px) scale(1.03, 1.03)`;
        navIndicator.style.height = `${height}px`;
      }
    } else {
      const expandedWidth = width + stretchAmount;
      if (direction > 0) {
        navIndicator.style.transform = `translate(${left}px, ${top}px) scale(1.03, 1.03)`;
        navIndicator.style.width = `${expandedWidth}px`;
      } else if (direction < 0) {
        navIndicator.style.transform = `translate(${left - stretchAmount}px, ${top}px) scale(1.03, 1.03)`;
        navIndicator.style.width = `${expandedWidth}px`;
      } else {
        navIndicator.style.transform = `translate(${left}px, ${top}px) scale(1.03, 1.03)`;
        navIndicator.style.width = `${width}px`;
      }
    }

    // Snaps cleanly into the slot and drops back to resting scale
    setTimeout(() => {
      navIndicator.style.transition = `
        transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
        width 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
        height 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
        opacity 0.3s var(--ease)
      `;
      navIndicator.style.transform = `translate(${left}px, ${top}px) scale(1, 1)`;
      navIndicator.style.width = `${width}px`;
      navIndicator.style.height = `${height}px`;
    }, 180);
  }

  function getClosestAnchor(currentCenter, isMobile) {
    let closest = navAnchors[0];
    let minDistance = Infinity;

    navAnchors.forEach(anchor => {
      const { left, top, width, height } = getAnchorOffsets(anchor);
      const center = isMobile ? top + height / 2 : left + width / 2;
      const dist = Math.abs(currentCenter - center);
      if (dist < minDistance) {
        minDistance = dist;
        closest = anchor;
      }
    });
    return closest;
  }

  function navigateTo(targetAnchor, smoothScroll = true) {
    if (!targetAnchor) return;
    navAnchors.forEach(a => a.classList.remove("active"));
    targetAnchor.classList.add("active");

    if (smoothScroll) {
      const targetId = targetAnchor.getAttribute("href");
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth" });
      }
    }
  }

  // 4. Pointer Drag Engine (Desktop Horizontal & Mobile Vertical)
  if (navLinks && navIndicator) {
    navLinks.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;

      const activeLink = document.querySelector('.nav-links a.active') || navAnchors[0];
      const isMobile = window.innerWidth <= 900;
      const offsets = getAnchorOffsets(activeLink);

      isPointerDown = true;
      isDragging = false;
      dragThresholdPassed = false;
      startX = e.clientX;
      startY = e.clientY;
      dragDirection = 0;

      initialLeft = offsets.left;
      initialTop = offsets.top;
      initialWidth = offsets.width;
      initialHeight = offsets.height;
    });

    window.addEventListener("pointermove", (e) => {
      if (!isPointerDown) return;

      const isMobile = window.innerWidth <= 900;
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      const mainDelta = isMobile ? deltaY : deltaX;

      dragDirection = mainDelta > 0 ? 1 : mainDelta < 0 ? -1 : 0;

      if (!isDragging && Math.abs(mainDelta) > 6) {
        isDragging = true;
        dragThresholdPassed = true;
        navIndicator.classList.add("is-dragging");
        navIndicator.classList.add("is-pointer-dragging"); // <-- ADD THIS
      }

      if (isDragging) {
        e.preventDefault();
        const containerRect = navLinks.getBoundingClientRect();
        const stretchFactor = 0.38;

        if (isMobile) {
          const stretch = Math.min(Math.abs(deltaY) * stretchFactor, 32);
          let newTop = deltaY > 0 ? initialTop + deltaY - stretch : initialTop + deltaY;
          let newHeight = initialHeight + stretch;

          const maxTop = containerRect.height - newHeight - 20;
          newTop = Math.max(20, Math.min(newTop, maxTop));
          const squeezeX = Math.max(0.92, 1 - (stretch / 200));

          navIndicator.style.width = `${initialWidth}px`;
          navIndicator.style.height = `${newHeight}px`;
          /* Float effect: scale(1.08) while dragging vertically */
          navIndicator.style.transform = `translate(${initialLeft}px, ${newTop}px) scale(${squeezeX * 1.08}, 1.08)`;

          const currentCenterY = newTop + newHeight / 2;
          const closest = getClosestAnchor(currentCenterY, true);
          if (closest && closest !== currentTargetAnchor) {
            currentTargetAnchor = closest;
            navAnchors.forEach(a => a.classList.remove("active"));
            closest.classList.add("active");
          }
        } else {
          const stretch = Math.min(Math.abs(deltaX) * stretchFactor, 45);
          let newLeft = deltaX > 0 ? initialLeft + deltaX - stretch : initialLeft + deltaX;
          let newWidth = initialWidth + stretch;

          const maxLeft = containerRect.width - newWidth;
          newLeft = Math.max(0, Math.min(newLeft, maxLeft));
          const squeezeY = Math.max(0.88, 1 - (stretch / 200));

          navIndicator.style.width = `${newWidth}px`;
          navIndicator.style.height = `${initialHeight}px`;
          /* Float effect: scale(1.08) while dragging horizontally */
          navIndicator.style.transform = `translate(${newLeft}px, ${initialTop}px) scale(1.08, ${squeezeY * 1.08})`;

          const currentCenterX = newLeft + newWidth / 2;
          const closest = getClosestAnchor(currentCenterX, false);
          if (closest && closest !== currentTargetAnchor) {
            currentTargetAnchor = closest;
            navAnchors.forEach(a => a.classList.remove("active"));
            closest.classList.add("active");
          }
        }
      }
    });

    window.addEventListener("pointerup", () => {
      if (!isPointerDown) return;
      isPointerDown = false;

      if (isDragging) {
        isDragging = false;
        
        // 1. Re-enable CSS transitions immediately on finger release
        navIndicator.classList.remove("is-pointer-dragging");

        // 2. Remove the glassy effect after momentum completes
        setTimeout(() => {
          navIndicator.classList.remove("is-dragging");
        }, 400);

        const isMobile = window.innerWidth <= 900;
        const targetAnchor = currentTargetAnchor || document.querySelector('.nav-links a.active') || navAnchors[0];

        if (targetAnchor) {
          isClickScrolling = true;
          clearTimeout(clickScrollTimer);
          clickScrollTimer = setTimeout(() => {
            isClickScrolling = false;
          }, 850);

          navigateTo(targetAnchor, true);
          releaseWithForwardOvershoot(targetAnchor, dragDirection);

          if (isMobile) {
            setTimeout(closeMobileNav, 300);
          }
        }
      }
    });
  }

  // 5. Click Navigation
  navAnchors.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      if (dragThresholdPassed) {
        dragThresholdPassed = false;
        return;
      }

      isClickScrolling = true;
      clearTimeout(clickScrollTimer);
      clickScrollTimer = setTimeout(() => {
        isClickScrolling = false;
      }, 850);

      navigateTo(link, true);
      updateNavIndicator(link, true);

      if (window.innerWidth <= 900) {
        setTimeout(closeMobileNav, 280);
      }
    });
  });

// --- ScrollSpy Observer ---
  const sections = ["home", "about", "education", "skills", "portfolio", "testimonials", "contact"]
    .map(id => document.getElementById(id)).filter(Boolean);

  function checkBottomScroll() {
    // If scrolled to the very bottom of the document, activate the last nav link (Contact)
    if ((window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 60)) {
      const lastAnchor = navAnchors[navAnchors.length - 1];
      if (lastAnchor && !lastAnchor.classList.contains("active")) {
        navAnchors.forEach(a => a.classList.remove("active"));
        lastAnchor.classList.add("active");
        updateNavIndicator(lastAnchor, false);
      }
      return true;
    }
    return false;
  }

  const navObserver = new IntersectionObserver((entries) => {
    if (isClickScrolling || isDragging || isPointerDown) return;
    if (checkBottomScroll()) return;

    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        const matchingLink = navAnchors.find(a => a.getAttribute("href") === "#" + id);
        if (matchingLink) {
          navAnchors.forEach(a => a.classList.remove("active"));
          matchingLink.classList.add("active");
          updateNavIndicator(matchingLink, false);
        }
      }
    });
  }, { rootMargin: "-30% 0px -40% 0px", threshold: 0.1 });

  sections.forEach(s => navObserver.observe(s));
  window.addEventListener("scroll", () => {
    if (!isClickScrolling && !isDragging && !isPointerDown) {
      checkBottomScroll();
    }
  }, { passive: true });
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
          <p class="edu-gpa">${e.gpa}</p>
          <p class="edu-school">${e.school}</p>
        </div>
      </div>`).join("");
  }

  /* ============================================================
     SKILLS SECTION — tabs + liquid drag & cards
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
              ${s.svg ? s.svg : `<span class="skill-icon-mask" style="--icon-url: url('${s.icon}');"></span>`}
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
  renderSkillGrid("programmingGrid", typeof PROGRAMMING_SKILLS !== "undefined" ? PROGRAMMING_SKILLS : []); /*[cite: 4]*/
  renderSkillGrid("softwareGrid", typeof SOFTWARE_SKILLS !== "undefined" ? SOFTWARE_SKILLS : []); /*[cite: 4]*/

  const tabsContainer = document.querySelector('.skills-tabs'); /*[cite: 4]*/
  const indicator = document.getElementById('skillsIndicator'); /*[cite: 4]*/
  const tabs = Array.from(document.querySelectorAll('.skills-tab'));

  let isSkillsPointerDown = false;
  let isSkillsDragging = false;
  let skillsStartX = 0;
  let skillsInitialLeft = 0;
  let skillsInitialWidth = 0;
  let skillsDragThresholdPassed = false;
  let skillsDragDirection = 0;
  let currentTargetTab = null;

  // Prevent ghost dragging
  tabs.forEach(tab => {
    tab.setAttribute("draggable", "false");
    tab.addEventListener("dragstart", (e) => e.preventDefault());
  });

  let skillsGlassTimer = null;

function updateIndicator(targetTab, animateFluid = true) {
  if (!targetTab || !indicator || !tabsContainer) return;

  const containerRect = tabsContainer.getBoundingClientRect();
  const tabRect = targetTab.getBoundingClientRect();
  const leftOffset = tabRect.left - containerRect.left;
  const tabWidth = tabRect.width;

  if (animateFluid) {
    indicator.classList.add("is-dragging");
    clearTimeout(skillsGlassTimer);
    skillsGlassTimer = setTimeout(() => indicator.classList.remove("is-dragging"), 450);
  }

  // Smooth direct slide to tab coordinates
  indicator.style.transform = `translateX(${leftOffset}px)`;
  indicator.style.width = `${tabWidth}px`;
}

  function releaseSkillsWithOvershoot(targetTab, direction) {
    if (!targetTab || !indicator || !tabsContainer) return;

    const containerRect = tabsContainer.getBoundingClientRect();
    const tabRect = targetTab.getBoundingClientRect();
    const targetLeft = tabRect.left - containerRect.left;
    const targetWidth = tabRect.width;

    const stretchAmount = 24;
    const expandedWidth = targetWidth + stretchAmount;

    indicator.style.transition = `
      transform 0.26s cubic-bezier(0.25, 1, 0.5, 1),
      width 0.26s cubic-bezier(0.25, 1, 0.5, 1)
    `;

    if (direction > 0) {
      indicator.style.transform = `translateX(${targetLeft}px) scale(1.03, 1.03)`;
      indicator.style.width = `${expandedWidth}px`;
    } else if (direction < 0) {
      indicator.style.transform = `translateX(${targetLeft - stretchAmount}px) scale(1.03, 1.03)`;
      indicator.style.width = `${expandedWidth}px`;
    } else {
      indicator.style.transform = `translateX(${targetLeft}px) scale(1.03, 1.03)`;
      indicator.style.width = `${targetWidth}px`;
    }

    setTimeout(() => {
      indicator.style.transition = `
        transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
        width 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)
      `;
      indicator.style.transform = `translateX(${targetLeft}px) scale(1, 1)`;
      indicator.style.width = `${targetWidth}px`;
    }, 180);
  }

  function getClosestSkillTab(currentCenterX) {
    const containerRect = tabsContainer.getBoundingClientRect();
    let closest = tabs[0];
    let minDistance = Infinity;

    tabs.forEach(tab => {
      const rect = tab.getBoundingClientRect();
      const tabCenterX = (rect.left - containerRect.left) + rect.width / 2;
      const dist = Math.abs(currentCenterX - tabCenterX);
      if (dist < minDistance) {
        minDistance = dist;
        closest = tab;
      }
    });
    return closest;
  }

  function switchSkillsPanel(tab) {
    document.querySelectorAll('.skills-panel').forEach(p => {
      p.classList.remove('active'); /*[cite: 4]*/
      p.classList.remove('is-visible'); /*[cite: 4]*/
    });

    const panel = document.getElementById('panel-' + tab.dataset.tab); /*[cite: 4]*/
    if (panel) {
      panel.classList.add('active'); /*[cite: 4]*/
      requestAnimationFrame(() => {
        panel.classList.add('is-visible'); /*[cite: 4]*/
        if (typeof fillBar === 'function') {
          panel.querySelectorAll('.skillbar-fill').forEach(fillBar); /*[cite: 4]*/
        }
      });
    }
  }

  function activateSkillTab(tab, animateFluid = true) {
    tabs.forEach(t => { 
      t.classList.remove('active'); /*[cite: 4]*/
      t.setAttribute('aria-selected', 'false'); /*[cite: 4]*/
    });

    tab.classList.add('active'); /*[cite: 4]*/
    tab.setAttribute('aria-selected', 'true'); /*[cite: 4]*/

    switchSkillsPanel(tab);
    if (animateFluid) updateIndicator(tab, true);
  }

  // --- Pointer Drag Handling on Skills Tab Container ---
  let skillsContainerRect = null;

  if (tabsContainer && indicator) {
    tabsContainer.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;

      isSkillsPointerDown = true;
      isSkillsDragging = false;
      skillsDragThresholdPassed = false;
      skillsStartX = e.clientX;
      skillsDragDirection = 0;

      skillsContainerRect = tabsContainer.getBoundingClientRect(); // Cache once
      const indicatorRect = indicator.getBoundingClientRect();
      skillsInitialLeft = indicatorRect.left - skillsContainerRect.left;
      skillsInitialWidth = indicatorRect.width;
    });

    window.addEventListener("pointermove", (e) => {
      if (!isSkillsPointerDown) return;

      const deltaX = e.clientX - skillsStartX;
      skillsDragDirection = deltaX > 0 ? 1 : deltaX < 0 ? -1 : 0;

      if (!isSkillsDragging && Math.abs(deltaX) > 6) {
        isSkillsDragging = true;
        skillsDragThresholdPassed = true;
        indicator.classList.add("is-dragging");
        indicator.classList.add("is-pointer-dragging"); // Suppress transition
      }

      if (isSkillsDragging) {
        e.preventDefault();
        const stretchFactor = 0.38;
        const stretch = Math.min(Math.abs(deltaX) * stretchFactor, 40);

        let newLeft = deltaX > 0 ? skillsInitialLeft + deltaX - stretch : skillsInitialLeft + deltaX;
        let newWidth = skillsInitialWidth + stretch;

        const maxLeft = (skillsContainerRect ? skillsContainerRect.width : tabsContainer.offsetWidth) - newWidth;
        newLeft = Math.max(0, Math.min(newLeft, maxLeft));

        const liquidSqueeze = Math.max(0.88, 1 - (stretch / 200));

        indicator.style.width = `${newWidth}px`;
        indicator.style.transform = `translateX(${newLeft}px) scale(1.08, ${liquidSqueeze * 1.08})`;

        const currentCenterX = newLeft + newWidth / 2;
        const closest = getClosestSkillTab(currentCenterX);
        if (closest && closest !== currentTargetTab) {
          currentTargetTab = closest;
          tabs.forEach(t => {
            t.classList.remove('active');
            t.setAttribute('aria-selected', 'false');
          });
          closest.classList.add('active');
          closest.setAttribute('aria-selected', 'true');
        }
      }
    });

    window.addEventListener("pointerup", () => {
      if (!isSkillsPointerDown) return;
      isSkillsPointerDown = false;

      if (isSkillsDragging) {
        isSkillsDragging = false;
        indicator.classList.remove("is-pointer-dragging"); // Restore smooth curve

        setTimeout(() => {
          indicator.classList.remove("is-dragging");
        }, 400);

        const containerWidth = skillsContainerRect ? skillsContainerRect.width : tabsContainer.offsetWidth;
        const targetTab = currentTargetTab || tabs[0];

        if (targetTab) {
          activateSkillTab(targetTab, false);
          releaseSkillsWithOvershoot(targetTab, skillsDragDirection);
        }
      }
    });
  }

  // --- Click Navigation on Tabs ---
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();

      if (skillsDragThresholdPassed) {
        skillsDragThresholdPassed = false;
        return;
      }

      activateSkillTab(tab, true);
    });
  });

  const initialActive = document.querySelector('.skills-tab.active'); /*[cite: 4]*/
  if (initialActive) {
    setTimeout(() => updateIndicator(initialActive, false), 50); /*[cite: 4]*/
  }

  window.addEventListener('resize', () => {
    const activeTab = document.querySelector('.skills-tab.active'); /*[cite: 4]*/
    if (activeTab) updateIndicator(activeTab, false); /*[cite: 4]*/
  });

  /* ============================================================
     PORTFOLIO — cards, liquid drag filters & interactive modal
     ============================================================ */
  const FILTERS = [
    { key: "all", label: "All" }, /*[cite: 4]*/
    { key: "certificate", label: "Certificate" }, /*[cite: 4]*/
    { key: "award", label: "Award" }, /*[cite: 4]*/
    { key: "scholarship", label: "Scholarship" }, /*[cite: 4]*/
    { key: "project", label: "Project" } /*[cite: 4]*/
  ];

  const filterRow = document.getElementById("filterRow"); /*[cite: 4]*/
  const portfolioGrid = document.getElementById("portfolioGrid"); /*[cite: 4]*/
  const pModal = document.getElementById("portfolioModal"); /*[cite: 4]*/
  const modalContent = document.querySelector(".p-modal-content"); /*[cite: 4]*/
  const modalBody = document.getElementById("modalBody"); /*[cite: 4]*/
  const modalClose = document.getElementById("modalClose"); /*[cite: 4]*/
  let activeButton = null; /*[cite: 4]*/

  function renderPortfolio() {
    if (!portfolioGrid || typeof PORTFOLIO_ITEMS === "undefined") return; /*[cite: 4]*/
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
      </div>`).join(""); /*[cite: 4]*/
  }
  renderPortfolio(); /*[cite: 4]*/
  /* ============================================================
     PORTFOLIO MODAL — liquid box expansion & delayed content reveal
     ============================================================ */
  function openModal(index, clickedBtn) {
    if (typeof PORTFOLIO_ITEMS === "undefined") return; /*[cite: 4]*/
    const item = PORTFOLIO_ITEMS[index]; /*[cite: 4]*/
    if (!item || !modalBody || !pModal || !modalContent) return; /*[cite: 4]*/

    activeButton = clickedBtn; /*[cite: 4]*/

    // Populate data
    modalBody.innerHTML = `
      <span class="p-modal-cat">${item.category}</span>
      <h3>${item.title}</h3>
      <p>${item.description || "No description provided."}</p>
      ${item.link && item.link !== '#' ? `<a href="${item.link}" target="_blank" rel="noopener" class="btn btn-primary btn-sm">Visit Project</a>` : ''}
    `; /*[cite: 4]*/

    if (clickedBtn) {
      clickedBtn.classList.add("button-hidden");

      const btnRect = clickedBtn.getBoundingClientRect();
      const modalRect = modalContent.getBoundingClientRect();

      const btnCenterX = btnRect.left + btnRect.width / 2;
      const btnCenterY = btnRect.top + btnRect.height / 2;

      const viewportCenterX = window.innerWidth / 2;
      const viewportCenterY = window.innerHeight / 2;

      const deltaX = btnCenterX - viewportCenterX;
      const deltaY = btnCenterY - viewportCenterY;
      const initialScale = Math.max(0.12, Math.min(0.25, btnRect.width / (modalRect.width || 540)));

      // Lock launch origin coordinates
      modalContent.style.setProperty("--origin-x", `${deltaX}px`);
      modalContent.style.setProperty("--origin-y", `${deltaY}px`);
      modalContent.style.setProperty("--origin-scale", `${initialScale}`);
    }

    requestAnimationFrame(() => {
      pModal.classList.add("open"); /*[cite: 4]*/
      document.body.style.overflow = "hidden"; /*[cite: 4]*/
    });
  }

  function closeModal() {
    if (!pModal) return; /*[cite: 4]*/

    pModal.classList.remove("open"); /*[cite: 4]*/
    document.body.style.overflow = ""; /*[cite: 4]*/

    setTimeout(() => {
      if (activeButton) {
        activeButton.classList.remove("button-hidden"); /*[cite: 4]*/
        activeButton = null; /*[cite: 4]*/
      }
    }, 180);
  }

  if (portfolioGrid) {
    portfolioGrid.addEventListener("click", (e) => {
      const btn = e.target.closest(".p-link"); /*[cite: 4]*/
      if (!btn) return; /*[cite: 4]*/
      e.preventDefault(); /*[cite: 4]*/
      const index = Number(btn.getAttribute("data-index")); /*[cite: 4]*/
      openModal(index, btn); /*[cite: 4]*/
    });
  }

  if (modalClose) {
    modalClose.addEventListener("click", (e) => {
      e.preventDefault(); /*[cite: 4]*/
      closeModal(); /*[cite: 4]*/
    });
  }

  if (pModal) {
    pModal.addEventListener("click", (e) => {
      if (e.target === pModal) closeModal(); /*[cite: 4]*/
    });
  }

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal(); /*[cite: 4]*/
  });

  if (filterRow) {
    filterRow.innerHTML = `
      <span class="portfolio-indicator" id="portfolioIndicator"></span>
      ${FILTERS.map((f, i) =>
        `<button type="button" class="filter-btn${i === 0 ? " active" : ""}" data-filter="${f.key}">${f.label}</button>`
      ).join("")}
    `; /*[cite: 4]*/
  }

  const portIndicator = document.getElementById("portfolioIndicator"); /*[cite: 4]*/
  const filterBtns = Array.from(document.querySelectorAll(".filter-btn"));

  let isPortPointerDown = false;
  let isPortDragging = false;
  let portStartX = 0;
  let portInitialLeft = 0;
  let portInitialWidth = 0;
  let portDragThresholdPassed = false;
  let portDragDirection = 0;
  let currentTargetFilterBtn = null;

  filterBtns.forEach(btn => {
    btn.setAttribute("draggable", "false");
    btn.addEventListener("dragstart", (e) => e.preventDefault());
  });

  let portGlassTimer = null;

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
    portIndicator.classList.add("is-dragging");
    clearTimeout(portGlassTimer);
    portGlassTimer = setTimeout(() => portIndicator.classList.remove("is-dragging"), 450);
  }

  // Smooth direct slide to button coordinates
  portIndicator.style.transform = `translateX(${leftOffset}px)`;
  portIndicator.style.width = `${btnWidth}px`;
}

function releasePortfolioWithOvershoot(targetBtn, direction) {
    if (!targetBtn || !portIndicator || !filterRow) return;

    const rowRect = filterRow.getBoundingClientRect();
    const btnRect = targetBtn.getBoundingClientRect();
    const targetLeft = btnRect.left - rowRect.left;
    const targetWidth = btnRect.width;

    const stretchAmount = 24;
    const expandedWidth = targetWidth + stretchAmount;

    portIndicator.style.transition = `
      transform 0.26s cubic-bezier(0.25, 1, 0.5, 1),
      width 0.26s cubic-bezier(0.25, 1, 0.5, 1)
    `;

    if (direction > 0) {
      portIndicator.style.transform = `translateX(${targetLeft}px) scale(1.03, 1.03)`;
      portIndicator.style.width = `${expandedWidth}px`;
    } else if (direction < 0) {
      portIndicator.style.transform = `translateX(${targetLeft - stretchAmount}px) scale(1.03, 1.03)`;
      portIndicator.style.width = `${expandedWidth}px`;
    } else {
      portIndicator.style.transform = `translateX(${targetLeft}px) scale(1.03, 1.03)`;
      portIndicator.style.width = `${targetWidth}px`;
    }

    setTimeout(() => {
      portIndicator.style.transition = `
        transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
        width 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)
      `;
      portIndicator.style.transform = `translateX(${targetLeft}px) scale(1, 1)`;
      portIndicator.style.width = `${targetWidth}px`;
    }, 180);
  }

  function getClosestFilterBtn(currentCenterX) {
    const rowRect = filterRow.getBoundingClientRect();
    let closest = filterBtns[0];
    let minDistance = Infinity;

    filterBtns.forEach(btn => {
      const rect = btn.getBoundingClientRect();
      const btnCenterX = (rect.left - rowRect.left) + rect.width / 2;
      const dist = Math.abs(currentCenterX - btnCenterX);
      if (dist < minDistance) {
        minDistance = dist;
        closest = btn;
      }
    });
    return closest;
  }

  function applyFilter(key) {
    if (!portfolioGrid) return;
    portfolioGrid.classList.remove("is-visible"); /*[cite: 4]*/

    document.querySelectorAll(".p-card").forEach(card => {
      const match = key === "all" || card.dataset.cat === key; /*[cite: 4]*/
      card.classList.toggle("hide", !match); /*[cite: 4]*/
    });

    requestAnimationFrame(() => {
      portfolioGrid.classList.add("is-visible"); /*[cite: 4]*/
    });
  }

  function activateFilterBtn(btn, animateFluid = true) {
    filterBtns.forEach(b => b.classList.remove("active")); /*[cite: 4]*/
    btn.classList.add("active"); /*[cite: 4]*/

    applyFilter(btn.dataset.filter);
    if (animateFluid) updatePortfolioIndicator(btn, true);
  }

  // --- Pointer Drag Handling on Filter Row ---
  let filterRowRect = null;

  if (filterRow && portIndicator) {
    filterRow.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;

      isPortPointerDown = true;
      isPortDragging = false;
      portDragThresholdPassed = false;
      portStartX = e.clientX;
      portDragDirection = 0;

      filterRowRect = filterRow.getBoundingClientRect(); // Cache once
      const indicatorRect = portIndicator.getBoundingClientRect();
      portInitialLeft = indicatorRect.left - filterRowRect.left;
      portInitialWidth = indicatorRect.width;
    });

    window.addEventListener("pointermove", (e) => {
      if (!isPortPointerDown) return;

      const deltaX = e.clientX - portStartX;
      portDragDirection = deltaX > 0 ? 1 : deltaX < 0 ? -1 : 0;

      if (!isPortDragging && Math.abs(deltaX) > 6) {
        isPortDragging = true;
        portDragThresholdPassed = true;
        portIndicator.classList.add("is-dragging");
        portIndicator.classList.add("is-pointer-dragging"); // Suppress transition
      }

      if (isPortDragging) {
        e.preventDefault();
        const stretchFactor = 0.38;
        const stretch = Math.min(Math.abs(deltaX) * stretchFactor, 42);

        let newLeft = deltaX > 0 ? portInitialLeft + deltaX - stretch : portInitialLeft + deltaX;
        let newWidth = portInitialWidth + stretch;

        const maxLeft = (filterRowRect ? filterRowRect.width : filterRow.offsetWidth) - newWidth;
        newLeft = Math.max(0, Math.min(newLeft, maxLeft));

        const liquidSqueeze = Math.max(0.88, 1 - (stretch / 200));

        portIndicator.style.width = `${newWidth}px`;
        portIndicator.style.transform = `translateX(${newLeft}px) scale(1.08, ${liquidSqueeze * 1.08})`;

        const currentCenterX = newLeft + newWidth / 2;
        const closest = getClosestFilterBtn(currentCenterX);
        if (closest && closest !== currentTargetFilterBtn) {
          currentTargetFilterBtn = closest;
          filterBtns.forEach(b => b.classList.remove("active"));
          closest.classList.add("active");
        }
      }
    });

    window.addEventListener("pointerup", () => {
      if (!isPortPointerDown) return;
      isPortPointerDown = false;

      if (isPortDragging) {
        isPortDragging = false;
        portIndicator.classList.remove("is-pointer-dragging"); // Restore smooth curve

        setTimeout(() => {
          portIndicator.classList.remove("is-dragging");
        }, 400);

        const targetBtn = currentTargetFilterBtn || filterBtns[0];

        if (targetBtn) {
          activateFilterBtn(targetBtn, false);
          releasePortfolioWithOvershoot(targetBtn, portDragDirection);
        }
      }
    });
  }

  // --- Click Navigation on Filter Buttons ---
  filterBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();

      if (portDragThresholdPassed) {
        portDragThresholdPassed = false;
        return;
      }

      activateFilterBtn(btn, true);
    });
  });

  const initialFilterActive = document.querySelector(".filter-btn.active"); /*[cite: 4]*/
  if (initialFilterActive) {
    setTimeout(() => updatePortfolioIndicator(initialFilterActive, false), 80); /*[cite: 4]*/
  }

  window.addEventListener("resize", () => {
    const active = document.querySelector(".filter-btn.active"); /*[cite: 4]*/
    if (active) updatePortfolioIndicator(active, false); /*[cite: 4]*/
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
   CONTACT INFO + form submission with validation & stretch animation
   ============================================================ */
if (typeof CONTACT_INFO !== "undefined") {
  const emailEl = document.getElementById("contactEmail");
  const locEl = document.getElementById("contactLocation");
  if (emailEl) emailEl.textContent = CONTACT_INFO.email;
  if (locEl) locEl.textContent = CONTACT_INFO.location;
}

const contactForm = document.getElementById('contactForm');

if (contactForm) {
  const submitBtn = contactForm.querySelector('button[type="submit"]');
  const requiredInputs = contactForm.querySelectorAll('input[required], textarea[required]');

  // Clear red error state when the user starts typing
  requiredInputs.forEach(input => {
    input.addEventListener('input', () => {
      if (input.value.trim() !== '') {
        input.closest('.field').classList.remove('has-error');
      }
    });
  });

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    let isValid = true;

    // Validate each required field
    requiredInputs.forEach(input => {
      const fieldContainer = input.closest('.field');
      if (!input.value.trim()) {
        fieldContainer.classList.add('has-error');
        isValid = false;
      } else {
        fieldContainer.classList.remove('has-error');
      }
    });

    if (!isValid) return;

    const formData = new FormData(contactForm);
    const originalText = submitBtn.textContent;

    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        contactForm.classList.add('form-submitting');

        setTimeout(() => {
          const successBox = document.createElement('div');
          successBox.className = 'contact-form-success';
          successBox.innerHTML = '<p>Messages sent successfully!</p>';

          contactForm.parentNode.replaceChild(successBox, contactForm);
        }, 350);
      } else {
        const data = await response.json();
        alert('Error: ' + (data.message || 'Submission failed.'));
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    } catch (error) {
      alert('Something went wrong. Please check your connection and try again.');
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
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
