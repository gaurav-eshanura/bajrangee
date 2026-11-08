/* Bajrangee - progressive enhancement only. Every section renders without
   JS; this file adds the sticky header, the mobile drawer, the scroll reveal
   and the product search. */
(function () {
  "use strict";

  var CATALOGUE = window.BJR_CATALOGUE || [];

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  };

  /* ----- sticky header state ------------------------------------------ */
  var header = $("#site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ----- mobile navigation ------------------------------------------- */
  var toggle = $("#nav-toggle");
  var nav = $("#primary-nav");
  if (toggle && nav) {
    var setNav = function (open) {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "मेन्यू बंद करें" : "मेन्यू खोलें");
    };
    toggle.addEventListener("click", function () {
      setNav(!nav.classList.contains("is-open"));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setNav(false);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 1080) setNav(false);
    });
  }

  /* ----- scroll reveal ------------------------------------------------ */
  var reveals = $$(".reveal");
  if (reveals.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ----- footer year -------------------------------------------------- */
  $$("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ======================================================================
     drawer
     ====================================================================== */
  var scrim = $("#scrim");
  var openPanel = null;
  var lastFocus = null;

  function openDrawer(id) {
    var panel = document.getElementById(id);
    if (!panel) return;
    lastFocus = document.activeElement;
    if (openPanel && openPanel !== panel) closeDrawer(true);
    openPanel = panel;
    panel.classList.add("is-open");
    panel.removeAttribute("inert");
    if (scrim) scrim.classList.add("is-open");
    document.body.style.overflow = "hidden";
    var focusable = panel.querySelector("input, button, a[href]");
    if (focusable) focusable.focus();
  }

  function closeDrawer(keepFocus) {
    if (!openPanel) return;
    openPanel.classList.remove("is-open");
    openPanel.setAttribute("inert", "");
    openPanel = null;
    if (scrim) scrim.classList.remove("is-open");
    document.body.style.overflow = "";
    if (!keepFocus && lastFocus && lastFocus.focus) lastFocus.focus();
  }

  $$("[data-open]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var target = btn.getAttribute("data-open");
      if (target === "search") {
        openDrawer("panel-search");
        var input = $("#search-input");
        if (input) input.focus();
      } else {
        openDrawer("panel-" + target);
      }
    });
  });

  $$("[data-close]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      closeDrawer();
    });
  });

  if (scrim) scrim.addEventListener("click", function () { closeDrawer(); });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (openPanel) closeDrawer();
      if (nav && nav.classList.contains("is-open")) toggle.click();
    }
  });

  /* ======================================================================
     product search - a specification finder, not a shop
     ====================================================================== */
  var searchInput = $("#search-input");
  var searchResults = $("#search-results");
  var searchCount = $("#search-count");

  function renderSearch(term) {
    if (!searchResults) return;
    var q = (term || "").trim().toLowerCase();
    var hits = CATALOGUE.filter(function (p) {
      if (!q) return false;
      return (
        p.name.toLowerCase().indexOf(q) > -1 ||
        p.size.toLowerCase().indexOf(q) > -1 ||
        p.note.toLowerCase().indexOf(q) > -1 ||
        p.kind.indexOf(q) > -1
      );
    });

    if (!q) {
      searchResults.innerHTML = "";
      if (searchCount) searchCount.textContent = "आकार, उपयोग या नाम से खोजें।";
      return;
    }

    if (searchCount) {
      searchCount.textContent = hits.length
        ? hits.length + " परिणाम"
        : "कोई परिणाम नहीं — हमसे सीधे पूछें।";
    }

    searchResults.innerHTML = hits
      .map(function (p) {
        return (
          '<a class="search-hit" href="' + p.href + '">' +
          '<span class="product-shot"><img src="' + p.img + '" alt="" loading="lazy"></span>' +
          "<span><strong>" + p.name + "</strong><span>" + p.size + " · " + p.note + "</span></span>" +
          "</a>"
        );
      })
      .join("");
  }

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      renderSearch(searchInput.value);
    });
    searchInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        var first = searchResults && searchResults.querySelector("a");
        if (first) first.click();
      }
    });
    renderSearch("");
  }

  /* ======================================================================
     filter chips
     ====================================================================== */
  var chips = $$("[data-filter]");
  if (chips.length) {
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        var kind = chip.getAttribute("data-filter");
        chips.forEach(function (c) {
          c.setAttribute("aria-pressed", String(c === chip));
        });
        $$("[data-kind]").forEach(function (card) {
          var match = kind === "all" || card.getAttribute("data-kind") === kind;
          card.hidden = !match;
        });
        var live = $("#filter-count");
        if (live) {
          var shown = $$("[data-kind]").filter(function (c) { return !c.hidden; }).length;
          live.textContent = shown + " उत्पाद दिख रहे हैं";
        }
      });
    });
  }

  /* ======================================================================
     back to top
     ====================================================================== */
  var toTop = $("#to-top");
  if (toTop) {
    window.addEventListener(
      "scroll",
      function () {
        toTop.classList.toggle("is-visible", window.scrollY > 700);
      },
      { passive: true }
    );
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
})();
