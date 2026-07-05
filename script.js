// ===== casinova theme — vanilla JS =====
(function () {
  "use strict";

  function renderStars() {
    var nodes = document.querySelectorAll(".stars");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var rating = parseFloat(el.getAttribute("data-rating")) || 0;
      if (rating < 0) rating = 0;
      if (rating > 5) rating = 5;

      var full = Math.floor(rating);
      var half = rating - full >= 0.5 ? 1 : 0;
      var empty = 5 - full - half;
      var html = "";

      for (var f = 0; f < full; f++) html += '<span class="full">★</span>';
      if (half) html += '<span class="half">★</span>';
      for (var e = 0; e < empty; e++) html += '<span class="empty">☆</span>';

      el.innerHTML = html;
      el.setAttribute("aria-label", rating + " out of 5");
    }
  }

  // FAQ accordion: native <details> handles toggling; this enforces
  // single-open behaviour as a graceful enhancement.
  function setupFaq() {
    var items = document.querySelectorAll(".faq-item");
    for (var i = 0; i < items.length; i++) {
      items[i].addEventListener("toggle", function (ev) {
        if (!this.open) return;
        for (var j = 0; j < items.length; j++) {
          if (items[j] !== this) items[j].removeAttribute("open");
        }
      });
    }
  }

  function setupSmoothScroll() {
    var links = document.querySelectorAll('a[href^="#"]');
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener("click", function (ev) {
        var href = this.getAttribute("href");
        if (!href || href === "#") return;
        var target = document.querySelector(href);
        if (!target) return;
        ev.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }

  function setupCtaTracking() {
    var ctas = document.querySelectorAll('a[target="_blank"]');
    for (var i = 0; i < ctas.length; i++) {
      ctas[i].addEventListener("click", function () {
        console.debug("CTA click:", this.getAttribute("href"));
      });
    }
  }

  // ===== Mobile burger menu =====
  function setupBurger() {
    var header = document.querySelector(".site-header");
    var burger = document.querySelector(".nav-burger");
    var nav = document.querySelector(".site-nav");
    if (!header || !burger || !nav) return;

    function close() {
      header.classList.remove("nav-open");
      burger.setAttribute("aria-expanded", "false");
    }

    burger.addEventListener("click", function () {
      var open = header.classList.toggle("nav-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });

    var links = nav.querySelectorAll("a");
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener("click", close);
    }

    window.addEventListener("resize", function () {
      if (window.innerWidth > 768) close();
    });
  }

  // ===== Scroll reveal =====
  function setupReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      for (var i = 0; i < els.length; i++) els[i].classList.add("is-visible");
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      for (var j = 0; j < entries.length; j++) {
        if (entries[j].isIntersecting) {
          entries[j].target.classList.add("is-visible");
          obs.unobserve(entries[j].target);
        }
      }
    }, { threshold: 0.12, rootMargin: "0px 0px -10% 0px" });
    for (var k = 0; k < els.length; k++) obs.observe(els[k]);
  }

  // ===== Countdown timer =====
  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  function setupCountdown() {
    var root = document.querySelector(".countdown");
    if (!root) return;

    var hours = parseInt(root.getAttribute("data-countdown-hours"), 10);
    if (!hours || hours < 1) hours = 24;
    var ms = hours * 3600 * 1000;
    var key = "casinova_countdown_" + hours;

    var cells = {
      days: root.querySelector('[data-cd="days"]'),
      hours: root.querySelector('[data-cd="hours"]'),
      minutes: root.querySelector('[data-cd="minutes"]'),
      seconds: root.querySelector('[data-cd="seconds"]')
    };

    function readDeadline() {
      var stored = null;
      try { stored = parseInt(localStorage.getItem(key), 10); } catch (e) {}
      if (!stored || isNaN(stored) || stored <= Date.now()) {
        stored = Date.now() + ms;
        try { localStorage.setItem(key, String(stored)); } catch (e) {}
      }
      return stored;
    }

    var deadline = readDeadline();

    function tick() {
      var diff = deadline - Date.now();
      if (diff <= 0) {
        deadline = Date.now() + ms;
        try { localStorage.setItem(key, String(deadline)); } catch (e) {}
        diff = ms;
      }
      var totalSec = Math.floor(diff / 1000);
      var d = Math.floor(totalSec / 86400);
      var h = Math.floor((totalSec % 86400) / 3600);
      var m = Math.floor((totalSec % 3600) / 60);
      var s = totalSec % 60;
      if (cells.days) cells.days.textContent = pad(d);
      if (cells.hours) cells.hours.textContent = pad(h);
      if (cells.minutes) cells.minutes.textContent = pad(m);
      if (cells.seconds) cells.seconds.textContent = pad(s);
    }

    tick();
    setInterval(tick, 1000);
  }

  // ===== Sticky mobile CTA =====
  function setupStickyCta() {
    var bar = document.querySelector(".sticky-cta");
    if (!bar) return;

    var hero = document.querySelector(".hero");
    var footer = document.querySelector(".site-footer");
    var footerVisible = false;

    function heroThreshold() {
      var h = hero ? hero.offsetHeight : 0;
      return h > 0 ? h : 400;
    }

    if (footer && "IntersectionObserver" in window) {
      var obs = new IntersectionObserver(function (entries) {
        footerVisible = entries[0].isIntersecting;
        update();
      });
      obs.observe(footer);
    }

    function update() {
      var pastHero = window.scrollY > heroThreshold();
      if (pastHero && !footerVisible) {
        bar.classList.add("show");
        bar.setAttribute("aria-hidden", "false");
      } else {
        bar.classList.remove("show");
        bar.setAttribute("aria-hidden", "true");
      }
    }

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderStars();
    setupFaq();
    setupSmoothScroll();
    setupCtaTracking();
    setupBurger();
    setupReveal();
    setupCountdown();
    setupStickyCta();
  });
})();
