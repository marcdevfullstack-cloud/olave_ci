/* ═══════════════════════════════════════════════════════════════
   OLAVE — CONTRAT COMMERCIAL (JS)
   Signature pad · Form validation · WhatsApp submission
═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  AOS.init({ duration: 600, easing: 'ease-out-cubic', once: true, offset: 60 });

  /* ─── NAVBAR SCROLL ─────────────────────────────────────────── */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  /* ─── BACK TO TOP ───────────────────────────────────────────── */
  const backToTop = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    backToTop?.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ─── READ PROGRESS ─────────────────────────────────────────── */
  const readBar    = document.getElementById('readBar');
  const readPct    = document.getElementById('readPct');
  const readPctVal = document.getElementById('readPctVal');
  window.addEventListener('scroll', () => {
    const docEl = document.documentElement;
    const scrollTop    = docEl.scrollTop || document.body.scrollTop;
    const scrollHeight = docEl.scrollHeight - docEl.clientHeight;
    const pct = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;
    if (readBar)    readBar.style.width = pct + '%';
    if (readPctVal) readPctVal.textContent = pct;
    if (readPct)    readPct.classList.toggle('show', pct > 3 && pct < 100);
  }, { passive: true });

  /* ─── ACTIVE TOC ────────────────────────────────────────────── */
  const sections  = document.querySelectorAll('.doc-section[id], .sign-section[id]');
  const tocLinks  = document.querySelectorAll('.toc-list a');
  const obsNav = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        tocLinks.forEach(a => a.classList.remove('active'));
        const a = document.querySelector(`.toc-list a[href="#${e.target.id}"]`);
        if (a) a.classList.add('active');
      }
    });
  }, { threshold: 0.3 });
  sections.forEach(s => obsNav.observe(s));

  /* ─── AUTO-FILL DATE ────────────────────────────────────────── */
  const agentDateInput = document.getElementById('agentDate');
  if (agentDateInput) {
    const now = new Date();
    agentDateInput.value = now.toLocaleDateString('fr-FR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  }

  /* ─── LIVE NAME PREVIEW ─────────────────────────────────────── */
  const agentNomInput = document.getElementById('agentNom');
  const previewNom    = document.getElementById('previewNom');
  agentNomInput?.addEventListener('input', () => {
    const val = agentNomInput.value.trim();
    if (previewNom) previewNom.textContent = val || '___';
  });

  /* ─── SIGNATURE PAD ─────────────────────────────────────────── */
  const canvas  = document.getElementById('signatureCanvas');
  const ctx     = canvas?.getContext('2d');
  let isDrawing = false;
  let sigEmpty  = true;

  const setupCanvas = () => {
    if (!canvas) return;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    canvas.width  = w * ratio;
    canvas.height = h * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.strokeStyle = '#0F1F5C';
    ctx.lineWidth   = 2.5;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
  };
  setupCanvas();
  window.addEventListener('resize', setupCanvas);

  const getPos = (e) => {
    const rect = canvas.getBoundingClientRect();
    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (e) => {
    e.preventDefault();
    isDrawing = true;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    sigEmpty = false;
    canvas.classList.add('has-sig');
    checkFormReady();
  };

  const endDraw = () => { isDrawing = false; };

  canvas?.addEventListener('mousedown',  startDraw);
  canvas?.addEventListener('mousemove',  draw);
  canvas?.addEventListener('mouseup',    endDraw);
  canvas?.addEventListener('mouseleave', endDraw);
  canvas?.addEventListener('touchstart', startDraw, { passive: false });
  canvas?.addEventListener('touchmove',  draw,      { passive: false });
  canvas?.addEventListener('touchend',   endDraw);

  /* Clear signature */
  document.getElementById('clearSig')?.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    sigEmpty = true;
    canvas.classList.remove('has-sig');
    checkFormReady();
  });

  /* ─── FORM VALIDATION / SUBMIT GATE ────────────────────────── */
  const submitBtn  = document.getElementById('submitBtn');
  const agreeCheck = document.getElementById('agreeCheck');

  const checkFormReady = () => {
    if (!submitBtn) return;
    const nom   = (document.getElementById('agentNom')?.value  || '').trim();
    const tel   = (document.getElementById('agentTel')?.value  || '').trim();
    const ville = (document.getElementById('agentVille')?.value|| '').trim();
    const zone  = (document.getElementById('agentZone')?.value || '').trim();
    const ok = nom && tel && ville && zone && !sigEmpty && agreeCheck?.checked;
    submitBtn.disabled = !ok;
  };

  ['agentNom','agentTel','agentEmail','agentVille','agentZone'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', checkFormReady);
  });
  agreeCheck?.addEventListener('change', checkFormReady);

  /* ─── FORM SUBMIT → SHOW MODAL ──────────────────────────────── */
  const form         = document.getElementById('contractForm');
  const confirmModal = document.getElementById('confirmModal');
  const agentRecap   = document.getElementById('agentRecap');
  const sigPreview   = document.getElementById('sigPreview');

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (submitBtn.disabled) return;

    const nom   = document.getElementById('agentNom').value.trim();
    const tel   = document.getElementById('agentTel').value.trim();
    const email = (document.getElementById('agentEmail')?.value || '').trim();
    const ville = document.getElementById('agentVille').value.trim();
    const zone  = document.getElementById('agentZone').value.trim();
    const date  = document.getElementById('agentDate').value;

    /* Build recap in modal */
    if (agentRecap) {
      agentRecap.innerHTML = [
        ['Agent', nom],
        ['Téléphone', tel],
        email ? ['Email', email] : null,
        ['Ville', ville],
        ['Zone d\'activité', zone],
        ['Date de signature', date],
      ].filter(Boolean).map(([k, v]) =>
        `<div><span>${k}</span><span>${v}</span></div>`
      ).join('');
    }

    /* Capture signature */
    if (sigPreview) {
      sigPreview.src = canvas.toDataURL('image/png');
    }

    /* Open modal */
    if (confirmModal) {
      confirmModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    /* Store data for WhatsApp send */
    form.dataset.wanom   = nom;
    form.dataset.watel   = tel;
    form.dataset.waemail = email;
    form.dataset.waville = ville;
    form.dataset.wazone  = zone;
    form.dataset.wadate  = date;
  });

  /* ─── MODAL CLOSE ───────────────────────────────────────────── */
  const closeModal = () => {
    confirmModal?.classList.remove('open');
    document.body.style.overflow = '';
  };
  document.getElementById('modalClose')?.addEventListener('click', closeModal);
  confirmModal?.addEventListener('click', (e) => {
    if (e.target === confirmModal) closeModal();
  });

  /* ─── SEND TO WHATSAPP ──────────────────────────────────────── */
  document.getElementById('sendToWa')?.addEventListener('click', () => {
    const nom   = form?.dataset.wanom   || '';
    const tel   = form?.dataset.watel   || '';
    const email = form?.dataset.waemail || 'Non renseigné';
    const ville = form?.dataset.waville || '';
    const zone  = form?.dataset.wazone  || '';
    const date  = form?.dataset.wadate  || new Date().toLocaleDateString('fr-FR');

    const msg =
      `✅ *CONTRAT AGENT COMMERCIAL OLAVE — SIGNATURE ÉLECTRONIQUE*\n\n` +
      `📋 Je soussigné(e) confirme avoir lu et accepté l'intégralité du Contrat d'Agent Commercial Indépendant Olave.\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `👤 *Nom complet :* ${nom}\n` +
      `📞 *Téléphone :* ${tel}\n` +
      `📧 *Email :* ${email}\n` +
      `🏙️ *Ville :* ${ville}\n` +
      `📍 *Zone d'activité :* ${zone}\n` +
      `📅 *Date de signature :* ${date}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `J'accepte les conditions du contrat (commission, confidentialité, obligations) et je suis prêt(e) à démarrer ma mission commerciale.\n\n` +
      `🚀 *Olave ne déçoit jamais !*`;

    window.open(`https://wa.me/2250779363809?text=${encodeURIComponent(msg)}`, '_blank');

    /* Success state */
    if (submitBtn) {
      submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Contrat envoyé !';
      submitBtn.style.background = 'linear-gradient(135deg, #22C55E, #16A34A)';
    }
    closeModal();
    showToast('🎉 Contrat transmis ! L\'équipe Olave vous contactera sous 48h.');
  });

  /* ─── PRINT / PDF ───────────────────────────────────────────── */
  const doPrint = () => window.print();
  document.getElementById('printBtn')?.addEventListener('click', doPrint);
  document.getElementById('modalPrintBtn')?.addEventListener('click', () => {
    closeModal();
    setTimeout(doPrint, 300);
  });

  /* ─── TOAST ─────────────────────────────────────────────────── */
  function showToast(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="fa-solid fa-check-circle"></i><span>${message}</span>`;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 6000);
  }

});
