const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-button]");
const mobileMenu = document.querySelector("[data-mobile-menu]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const updateHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 24);
};

const closeMenu = () => {
  if (!menuButton || !mobileMenu) return;
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "メニューを開く");
  mobileMenu.setAttribute("aria-hidden", "true");
  mobileMenu.classList.remove("is-open");
  header?.classList.remove("is-menu-open");
  document.body.classList.remove("menu-open");
};

const toggleMenu = () => {
  if (!menuButton || !mobileMenu) return;
  const willOpen = menuButton.getAttribute("aria-expanded") !== "true";
  menuButton.setAttribute("aria-expanded", String(willOpen));
  menuButton.setAttribute("aria-label", willOpen ? "メニューを閉じる" : "メニューを開く");
  mobileMenu.setAttribute("aria-hidden", String(!willOpen));
  mobileMenu.classList.toggle("is-open", willOpen);
  header?.classList.toggle("is-menu-open", willOpen);
  document.body.classList.toggle("menu-open", willOpen);

  if (willOpen) mobileMenu.querySelector("a")?.focus();
};

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

menuButton?.addEventListener("click", toggleMenu);
mobileMenu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
    menuButton?.focus();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth >= 1280) closeMenu();
});

const revealItems = document.querySelectorAll("[data-reveal]");

if ("IntersectionObserver" in window && !reducedMotion.matches) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -7%" }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-revealed"));
}

const parallaxItems = document.querySelectorAll("[data-parallax]");
const canUseParallax = window.matchMedia("(min-width: 768px)").matches && !reducedMotion.matches;

if (canUseParallax && parallaxItems.length) {
  let isTicking = false;

  const updateParallax = () => {
    const viewportCenter = window.innerHeight / 2;
    parallaxItems.forEach((item) => {
      const rect = item.getBoundingClientRect();
      const distance = Math.max(-1, Math.min(1, (rect.top + rect.height / 2 - viewportCenter) / window.innerHeight));
      item.style.setProperty("--parallax-y", `${Math.round(distance * -18)}px`);
    });
    isTicking = false;
  };

  const requestParallaxUpdate = () => {
    if (isTicking) return;
    isTicking = true;
    window.requestAnimationFrame(updateParallax);
  };

  window.addEventListener("scroll", requestParallaxUpdate, { passive: true });
  window.addEventListener("resize", requestParallaxUpdate, { passive: true });
  requestParallaxUpdate();
}

const worksRail = document.querySelector("[data-works-rail]");
const worksCards = worksRail ? [...worksRail.querySelectorAll("[data-work-id]")] : [];
const worksPrev = document.querySelector("[data-works-prev]");
const worksNext = document.querySelector("[data-works-next]");
const worksCurrent = document.querySelector("[data-works-current]");

if (worksRail && worksCards.length) {
  let activeWorkIndex = 0;
  let scrollFrame;
  let pointerStartX = 0;
  let pointerStartScroll = 0;
  let didDrag = false;

  const updateWorksControls = () => {
    const railLeft = worksRail.getBoundingClientRect().left;
    activeWorkIndex = worksCards.reduce((closestIndex, card, index) => {
      const closestDistance = Math.abs(worksCards[closestIndex].getBoundingClientRect().left - railLeft);
      const distance = Math.abs(card.getBoundingClientRect().left - railLeft);
      return distance < closestDistance ? index : closestIndex;
    }, 0);

    if (worksCurrent) worksCurrent.textContent = String(activeWorkIndex + 1);
    if (worksPrev) worksPrev.disabled = activeWorkIndex === 0;
    if (worksNext) worksNext.disabled = activeWorkIndex === worksCards.length - 1;
  };

  const moveWorks = (direction) => {
    const nextIndex = Math.max(0, Math.min(worksCards.length - 1, activeWorkIndex + direction));
    worksCards[nextIndex].scrollIntoView({
      behavior: reducedMotion.matches ? "auto" : "smooth",
      block: "nearest",
      inline: "start",
    });
  };

  worksPrev?.addEventListener("click", () => moveWorks(-1));
  worksNext?.addEventListener("click", () => moveWorks(1));

  worksRail.addEventListener("scroll", () => {
    window.cancelAnimationFrame(scrollFrame);
    scrollFrame = window.requestAnimationFrame(updateWorksControls);
  }, { passive: true });

  worksRail.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveWorks(-1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      moveWorks(1);
    }
  });

  worksRail.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    pointerStartX = event.clientX;
    pointerStartScroll = worksRail.scrollLeft;
    didDrag = false;
    worksRail.setPointerCapture(event.pointerId);
    worksRail.classList.add("is-dragging");
  });

  worksRail.addEventListener("pointermove", (event) => {
    if (!worksRail.classList.contains("is-dragging")) return;
    const distance = event.clientX - pointerStartX;
    if (Math.abs(distance) > 4) didDrag = true;
    worksRail.scrollLeft = pointerStartScroll - distance;
  });

  const stopWorksDrag = (event) => {
    if (!worksRail.classList.contains("is-dragging")) return;
    worksRail.classList.remove("is-dragging");
    if (worksRail.hasPointerCapture(event.pointerId)) worksRail.releasePointerCapture(event.pointerId);
  };

  worksRail.addEventListener("pointerup", stopWorksDrag);
  worksRail.addEventListener("pointercancel", stopWorksDrag);
  worksRail.addEventListener("click", (event) => {
    if (!didDrag) return;
    event.preventDefault();
    didDrag = false;
  }, true);

  updateWorksControls();
}
