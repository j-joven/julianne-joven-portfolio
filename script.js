(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));


  // ----------------------------
  const prefersReducedMotion = () =>
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ----------------------------
  const enableSmoothScrolling = () => {
    if (prefersReducedMotion()) return;

    document.addEventListener("click", (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;

      const href = link.getAttribute("href");
      if (!href || href === "#") return;

      const target = $(href);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });

      history.pushState(null, "", href);
    });
  };


  // ----------------------------
  const enableMobileMenu = () => {
    const button = $("#nav-toggle");
    const menu = $("#nav-menu");
    if (!button || !menu) return;

    const openMenu = () => {
      menu.hidden = false;
      button.setAttribute("aria-expanded", "true");
      document.body.classList.add("nav-open");

      const firstLink = $('a', menu);
      firstLink && firstLink.focus();
    };

    const closeMenu = () => {
      menu.hidden = true;
      button.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-open");
      button.focus();
    };

    button.addEventListener("click", () => {
      const expanded = button.getAttribute("aria-expanded") === "true";
      expanded ? closeMenu() : openMenu();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && button.getAttribute("aria-expanded") === "true") {
        closeMenu();
      }
    });

    menu.addEventListener("click", (e) => {
      const link = e.target.closest("a");
      if (!link) return;
      closeMenu();
    });

    menu.hidden = true;
    button.setAttribute("aria-expanded", "false");
  };

  // ----------------------------

  const enableLightbox = () => {
    const imgs = $$("img[data-lightbox]");
    if (!imgs.length) return;

    const overlay = document.createElement("div");
    overlay.className = "lightbox";
    overlay.hidden = true;
    overlay.innerHTML = `
      <div class="lightbox__backdrop" data-close tabindex="-1"></div>
      <figure class="lightbox__panel" role="dialog" aria-modal="true" aria-label="Image viewer">
        <button class="lightbox__close" type="button" aria-label="Close image" data-close>×</button>
        <img class="lightbox__img" alt="" />
        <figcaption class="lightbox__cap" aria-live="polite"></figcaption>
      </figure>
    `;
    document.body.appendChild(overlay);

    const lbImg = $(".lightbox__img", overlay);
    const lbCap = $(".lightbox__cap", overlay);
    const closeBtns = $$("[data-close]", overlay);

    let lastFocus = null;

    const open = (img) => {
      lastFocus = document.activeElement;

      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt || "";
      lbCap.textContent = img.alt || "";

      overlay.hidden = false;
      document.body.classList.add("lightbox-open");

      const closeBtn = $(".lightbox__close", overlay);
      closeBtn && closeBtn.focus();
    };

    const close = () => {
      overlay.hidden = true;
      document.body.classList.remove("lightbox-open");
      lbImg.src = "";
      lbCap.textContent = "";
      lastFocus && lastFocus.focus();
    };

    imgs.forEach((img) => {
      img.style.cursor = "zoom-in";
      img.addEventListener("click", () => open(img));
    });

    closeBtns.forEach((btn) => btn.addEventListener("click", close));

    document.addEventListener("keydown", (e) => {
      if (!overlay.hidden && e.key === "Escape") close();
    });

    overlay.addEventListener("click", (e) => {
      if (e.target.matches(".lightbox__backdrop")) close();
    });
  };

  // ----------------------------
  const enableFormValidation = () => {
    const form = $("#contact-form");
    if (!form) return;

    const fields = $$("input, textarea", form);

    const setError = (el, msg) => {
      el.setAttribute("aria-invalid", "true");
      const id = el.getAttribute("aria-describedby");
      const help = id ? $("#" + id) : null;
      if (help) help.textContent = msg;
    };

    const clearError = (el) => {
      el.removeAttribute("aria-invalid");
      const id = el.getAttribute("aria-describedby");
      const help = id ? $("#" + id) : null;
      if (help) help.textContent = "";
    };

    const validate = (el) => {
      if (el.required && !el.value.trim()) {
        setError(el, "This field is required.");
        return false;
      }
      if (el.type === "email" && el.value) {
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value);
        if (!ok) {
          setError(el, "Please enter a valid email.");
          return false;
        }
      }
      clearError(el);
      return true;
    };

    fields.forEach((el) => {
      el.addEventListener("input", () => validate(el), { passive: true });
      el.addEventListener("blur", () => validate(el), { passive: true });
    });

    form.addEventListener("submit", (e) => {
      const allOk = fields.every(validate);
      if (!allOk) e.preventDefault();
    });
  };

  // ----------------------------
  const enableImageLoadingState = () => {
    const imgs = $$("img");
    imgs.forEach((img) => {
      if (img.complete) return;
      img.classList.add("is-loading");
      img.addEventListener(
        "load",
        () => img.classList.remove("is-loading"),
        { once: true }
      );
      img.addEventListener(
        "error",
        () => img.classList.remove("is-loading"),
        { once: true }
      );
    });
  };

  // Init
  enableSmoothScrolling();
  enableMobileMenu();
  enableLightbox();
  enableFormValidation();
  enableImageLoadingState();
  
})();