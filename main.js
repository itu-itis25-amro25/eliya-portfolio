/* Eliya Amro — shared site script */
(function () {
  document.documentElement.classList.remove('no-js');

  // Mobile navigation
  var toggle = document.querySelector('.nav-toggle');
  var links = document.getElementById('nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      links.classList.toggle('open', !open);
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        toggle.setAttribute('aria-expanded', 'false');
        links.classList.remove('open');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && links.classList.contains('open')) {
        toggle.setAttribute('aria-expanded', 'false');
        links.classList.remove('open');
        toggle.focus();
      }
    });
  }

  // Header shadow on scroll
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Reveal on scroll
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  // Footer year
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Contact form → opens WhatsApp or email with the message pre-filled
  var form = document.getElementById('contact-form');
  if (form) {
    function compose() {
      var name = form.elements['name'].value.trim();
      var topic = form.elements['topic'].value;
      var msg = form.elements['message'].value.trim();
      if (!name || !msg) {
        form.reportValidity();
        return null;
      }
      return { name: name, topic: topic, msg: msg };
    }
    document.getElementById('send-whatsapp').addEventListener('click', function () {
      var d = compose(); if (!d) return;
      var text = 'Hi Eliya, I\'m ' + d.name + '. [' + d.topic + ']\n\n' + d.msg;
      window.open('https://wa.me/905316755800?text=' + encodeURIComponent(text), '_blank', 'noopener');
    });
    document.getElementById('send-email').addEventListener('click', function () {
      var d = compose(); if (!d) return;
      var subject = d.topic + ' — from ' + d.name;
      window.location.href = 'mailto:eliaamro9@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(d.msg + '\n\n— ' + d.name);
    });
    form.addEventListener('submit', function (e) { e.preventDefault(); });
  }
})();
