/* ═══════════════════════════════════════════════════════════════
   OLAVE LANDING PAGE — JavaScript
═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ─── AOS Init ─────────────────────────────────────────────── */
  AOS.init({
    duration: 700,
    easing: 'ease-out-cubic',
    once: true,
    offset: 80,
  });

  /* ─── NAVBAR ───────────────────────────────────────────────── */
  const navbar  = document.getElementById('navbar');
  const burger  = document.getElementById('navBurger');
  const navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  burger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const isOpen = navLinks.classList.contains('open');
    burger.setAttribute('aria-expanded', isOpen);
    // Animate burger to X
    const spans = burger.querySelectorAll('span');
    if (isOpen) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });

  // Close nav on link click
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      burger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    });
  });

  /* ─── ACTIVE NAV LINK on scroll ────────────────────────────── */
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = navLinks.querySelectorAll('a[href^="#"]');

  const observerNav = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navAnchors.forEach(a => a.classList.remove('active'));
        const active = navLinks.querySelector(`a[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => observerNav.observe(s));

  /* ─── COUNTER ANIMATION ────────────────────────────────────── */
  const counters = document.querySelectorAll('.stat-number[data-count]');

  const formatNumber = (num) => {
    if (num >= 100000) return (num / 1000).toFixed(0) + 'K';
    if (num >= 10000)  return (num / 1000).toFixed(0) + 'K';
    return num.toLocaleString('fr-FR');
  };

  const animateCounter = (el) => {
    const target = parseInt(el.dataset.count);
    const duration = 2000;
    const start = performance.now();

    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(eased * target);
      el.textContent = formatNumber(current);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => counterObserver.observe(c));

  /* ─── TESTIMONIALS CAROUSEL ────────────────────────────────── */
  const track  = document.getElementById('testimonialsTrack');
  const cards  = track ? track.querySelectorAll('.testimonial-card') : [];
  const dotsEl = document.getElementById('carouselDots');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  if (track && cards.length) {
    let current = 0;
    let autoTimer;
    const visibleCount = () => window.innerWidth <= 900 ? 1 : window.innerWidth <= 1100 ? 2 : 3;

    // Create dots
    const createDots = () => {
      if (!dotsEl) return;
      dotsEl.innerHTML = '';
      const total = cards.length;
      for (let i = 0; i < total; i++) {
        const dot = document.createElement('div');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.addEventListener('click', () => goTo(i));
        dotsEl.appendChild(dot);
      }
    };
    createDots();

    const updateDots = () => {
      dotsEl?.querySelectorAll('.carousel-dot').forEach((d, i) => {
        d.classList.toggle('active', i === current);
      });
    };

    const goTo = (index) => {
      const total = cards.length;
      current = (index + total) % total;
      const vc = visibleCount();
      const cardWidth = track.parentElement.offsetWidth / vc;
      track.style.transform = `translateX(-${current * cardWidth}px)`;

      // Update card widths
      cards.forEach(c => { c.style.flex = `0 0 calc(${100 / vc}% - ${(vc - 1) * 24 / vc}px)`; });

      updateDots();
    };

    const next = () => goTo(current + 1);
    const prev = () => goTo(current - 1);

    prevBtn?.addEventListener('click', () => { clearInterval(autoTimer); prev(); startAuto(); });
    nextBtn?.addEventListener('click', () => { clearInterval(autoTimer); next(); startAuto(); });

    const startAuto = () => {
      autoTimer = setInterval(next, 5000);
    };
    startAuto();

    // Drag / swipe
    let startX = 0;
    track.addEventListener('mousedown', e => { startX = e.clientX; });
    track.addEventListener('mouseup', e => {
      const diff = e.clientX - startX;
      if (Math.abs(diff) > 50) { clearInterval(autoTimer); diff < 0 ? next() : prev(); startAuto(); }
    });
    track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = e.changedTouches[0].clientX - startX;
      if (Math.abs(diff) > 50) { clearInterval(autoTimer); diff < 0 ? next() : prev(); startAuto(); }
    });

    window.addEventListener('resize', () => goTo(current));
    goTo(0);
  }

  /* ─── ROLE TABS ────────────────────────────────────────────── */
  const roleTabs = document.querySelectorAll('.role-tab');
  const rolePanels = document.querySelectorAll('.role-panel');

  roleTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const role = tab.dataset.role;
      roleTabs.forEach(t => t.classList.toggle('active', t.dataset.role === role));
      rolePanels.forEach(p => p.classList.toggle('active', p.dataset.role === role));
    });
  });

  /* ─── FAQ ACCORDION ────────────────────────────────────────── */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer   = item.querySelector('.faq-answer');

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all
      faqItems.forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq-answer').style.maxHeight = null;
      });

      // Open clicked if was closed
      if (!isOpen) {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  /* ─── CTA FORM SUBMIT → WhatsApp ───────────────────────────── */
  const ctaForm = document.getElementById('ctaForm');

  ctaForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = ctaForm.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;

    const name   = (document.getElementById('ctaName')?.value   || '').trim();
    const phone  = (document.getElementById('ctaPhone')?.value  || '').trim();
    const lavage = (document.getElementById('ctaLavage')?.value || '').trim();

    const msg =
      `Bonjour Olave ! 👋\n\nJe souhaite démarrer avec votre application.\n\n` +
      `👤 Prénom : ${name}\n` +
      `📞 Téléphone : ${phone}\n` +
      `🚗 Mon lavage : ${lavage}\n\n` +
      `Merci de me contacter pour plus d'informations !`;

    // Loading state
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Ouverture WhatsApp...';

    setTimeout(() => {
      window.open(`https://wa.me/2250779363809?text=${encodeURIComponent(msg)}`, '_blank');
      btn.innerHTML = '<i class="fa-solid fa-check"></i> Redirection effectuée !';
      btn.style.background = 'linear-gradient(135deg, #22C55E, #16A34A)';
      ctaForm.reset();
      showToast('WhatsApp ouvert ! L\'équipe Olave vous répondra très vite. 🚀');
      setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = originalText;
        btn.style.background = '';
      }, 4000);
    }, 800);
  });

  /* ─── TOAST ────────────────────────────────────────────────── */
  function showToast(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="fa-solid fa-check-circle"></i><span>${message}</span>`;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 5000);
  }

  /* ─── SMOOTH SCROLL for anchors ────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ─── BACK TO TOP ──────────────────────────────────────────── */
  const backToTop = document.getElementById('backToTop');

  window.addEventListener('scroll', () => {
    backToTop?.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ─── PARALLAX BLOBS ───────────────────────────────────────── */
  const blobs = document.querySelectorAll('.hero-blob');
  window.addEventListener('mousemove', (e) => {
    const { clientX, clientY } = e;
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const dx = (clientX - cx) / cx;
    const dy = (clientY - cy) / cy;

    blobs.forEach((blob, i) => {
      const factor = (i + 1) * 12;
      blob.style.transform = `translate(${dx * factor}px, ${dy * factor}px)`;
    });
  });

  /* ─── PHONE SCREEN TYPING EFFECT ──────────────────────────── */
  // Stagger animation on activity items
  const activityItems = document.querySelectorAll('.app-activity-item');
  activityItems.forEach((item, i) => {
    item.style.opacity = '0';
    item.style.transform = 'translateX(20px)';
    setTimeout(() => {
      item.style.transition = 'all 0.4s ease';
      item.style.opacity = '1';
      item.style.transform = 'translateX(0)';
    }, 1800 + i * 300);
  });

  /* ─── INTERSECTION for plan cards highlight ────────────────── */
  const planCards = document.querySelectorAll('.plan-card');
  const planObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = entry.target.classList.contains('plan-card--popular')
            ? 'translateY(-12px)' : 'translateY(0)';
        }, i * 120);
      }
    });
  }, { threshold: 0.2 });

  planCards.forEach(c => {
    c.style.opacity = '0';
    c.style.transition = 'opacity .5s ease, transform .5s ease';
    planObserver.observe(c);
  });

});
