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

  /* ======================================================================
     B2B Estimator Calculator
     ====================================================================== */
  var estBiz = #est-biz;
  var estScale = #est-scale;
  var estOutput = #est-output;
  var estWaBtn = #est-wa-btn;

  var EST_DATA = {
    kirana: {
      '200': { dona: '300 पीस (3 पैकेट)', plate: '200 पीस (2 पैकेट)', thali: '5 सेट', carton: '1 रीसेल कार्टन', msg: 'किराना दुकान के लिए 200 ग्राहक दैनिक रीसेल मिक्स' },
      '500': { dona: '800 पीस (8 पैकेट)', plate: '500 पीस (5 पैकेट)', thali: '15 सेट', carton: '2 रीसेल कार्टन', msg: 'किराना दुकान के लिए 500 ग्राहक दैनिक रीसेल मिक्स' },
      '1000': { dona: '1,500 पीस (15 पैकेट)', plate: '1,000 पीस (10 पैकेट)', thali: '30 सेट', carton: '4 कार्टन', msg: 'किराना दुकान के लिए 1000 ग्राहक साप्ताहिक लॉट' },
      '2500': { dona: '4,000 पीस (40 पैकेट)', plate: '2,500 पीस (25 पैकेट)', thali: '100 सेट', carton: '10 थोक डिस्ट्रीब्यूटर कार्टन', msg: 'किराना दुकान के लिए 2500 ग्राहक थोक लॉट' }
    },
    caterer: {
      '200': { dona: '400 पीस कटोरी दोना', plate: '250 पीस 10 इंच प्लेट', thali: '20 अन्नपूर्णा सेट', carton: '1 कैटरिंग कार्टन', msg: 'कैटरिंग पार्टी के लिए 200 मेहमानों का सेट' },
      '500': { dona: '1,000 पीस दोना', plate: '600 पीस प्लेट', thali: '50 अन्नपूर्णा सेट', carton: '3 कैटरिंग कार्टन', msg: 'कैटरिंग पार्टी के लिए 500 मेहमानों का सेट' },
      '1000': { dona: '2,000 पीस दोना', plate: '1,200 पीस प्लेट', thali: '100 अन्नपूर्णा सेट', carton: '6 कैटरिंग कार्टन', msg: 'शादी/बैंकेट के लिए 1000 मेहमानों का सेट' },
      '2500': { dona: '5,000 पीस दोना', plate: '3,000 पीस प्लेट', thali: '250 अन्नपूर्णा सेट', carton: '15 थोक बैंकेट कार्टन', msg: 'विशाल आयोजन के लिए 2500 मेहमानों का सेट' }
    },
    dhaba: {
      '200': { dona: '500 पीस 6 इंच दाल दोना', plate: '300 पीस प्लेट', thali: '10 सेट', carton: '1 ढाबा कार्टन', msg: 'ढाबा/रेस्टोरेंट के लिए 200 दैनिक भोजन आवश्यकता' },
      '500': { dona: '1,200 पीस दाल/सब्जी दोना', plate: '700 पीस प्लेट', thali: '25 सेट', carton: '3 ढाबा कार्टन', msg: 'ढाबा/रेस्टोरेंट के लिए 500 दैनिक भोजन आवश्यकता' },
      '1000': { dona: '2,500 पीस दोना', plate: '1,500 पीस प्लेट', thali: '50 सेट', carton: '6 ढाबा कार्टन', msg: 'ढाबा/रेस्टोरेंट के लिए 1000 भोजन आवश्यकता' },
      '2500': { dona: '6,000 पीस दोना', plate: '3,500 पीस प्लेट', thali: '150 सेट', carton: '14 ढाबा कार्टन', msg: 'ढाबा/रेस्टोरेंट के लिए 2500 भोजन थोक सप्लाई' }
    },
    tea: {
      '200': { dona: '400 पीस बटाशा व 5.5 इंच दोना', plate: '100 पीस 7 इंच नाश्ता प्लेट', thali: '0 सेट', carton: '1 चाय/नाश्ता कार्टन', msg: 'चाय/नाश्ता दुकान के लिए 200 दैनिक ग्राहक' },
      '500': { dona: '1,000 पीस बटाशा व 6 इंच दोना', plate: '250 पीस नाश्ता प्लेट', thali: '0 सेट', carton: '2 चाय/नाश्ता कार्टन', msg: 'चाय/नाश्ता दुकान के लिए 500 दैनिक ग्राहक' },
      '1000': { dona: '2,200 पीस दोना', plate: '500 पीस नाश्ता प्लेट', thali: '0 सेट', carton: '4 चाय/नाश्ता कार्टन', msg: 'चाय/नाश्ता दुकान के लिए 1000 दैनिक ग्राहक' },
      '2500': { dona: '5,500 पीस दोना', plate: '1,200 पीस नाश्ता प्लेट', thali: '0 सेट', carton: '9 थोक कार्टन', msg: 'चाय/नाश्ता दुकान के लिए 2500 दैनिक ग्राहक' }
    }
  };

  function updateEstimator() {
    if (!estBiz || !estScale || !estOutput) return;
    var biz = estBiz.value;
    var scale = estScale.value;
    var data = (EST_DATA[biz] && EST_DATA[biz][scale]) || EST_DATA.caterer['500'];

    estOutput.innerHTML =
      '<li><strong>अनुमानित दोना:</strong> <span>' + data.dona + '</span></li>' +
      '<li><strong>अनुमानित प्लेट:</strong> <span>' + data.plate + '</span></li>' +
      '<li><strong>अन्नपूर्णा थाल पैक:</strong> <span>' + data.thali + '</span></li>' +
      '<li><strong>कुल कार्टन (MOQ):</strong> <span>' + data.carton + '</span></li>';

    if (estWaBtn) {
      var text = 'नमस्ते बजरंगी टीम, मुझे थोक ऑर्डर का रेट जानना है। विवरण: ' + data.msg +
        ' (दोना: ' + data.dona + ', प्लेट: ' + data.plate + ', थाली: ' + data.thali + ', कार्टन: ' + data.carton + ')। कृपया दर सूची और डिलीवरी समय साझा करें।';
      estWaBtn.href = 'https://wa.me/919839436346?text=' + encodeURIComponent(text);
    }
  }

  if (estBiz && estScale) {
    estBiz.addEventListener('change', updateEstimator);
    estScale.addEventListener('change', updateEstimator);
    updateEstimator();
  }
})();
