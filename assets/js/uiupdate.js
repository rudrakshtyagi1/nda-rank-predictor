// ============================================================
//  ui-updates.js — Animations, Toasts, UI Helpers
//  Ye file index.html aur result.html dono mein use hogi
// ============================================================

// ============================================================
//  TOAST NOTIFICATIONS
// ============================================================
function showToast(message, type = 'info', duration = 3000) {
  // Remove existing toast
  const existing = document.getElementById('nda-toast');
  if (existing) existing.remove();

  const colors = {
    success: { bg: 'rgba(82,183,136,0.15)',  border: 'rgba(82,183,136,0.4)',  text: '#52b788' },
    error:   { bg: 'rgba(230,57,70,0.15)',   border: 'rgba(230,57,70,0.4)',   text: '#e63946' },
    warning: { bg: 'rgba(255,193,7,0.15)',   border: 'rgba(255,193,7,0.4)',   text: '#FFC107' },
    info:    { bg: 'rgba(200,181,96,0.12)',  border: 'rgba(200,181,96,0.3)',  text: '#c8b560' },
  };

  const c = colors[type] || colors.info;

  const toast = document.createElement('div');
  toast.id = 'nda-toast';
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%) translateY(80px);
    background: ${c.bg};
    border: 1px solid ${c.border};
    color: ${c.text};
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    letter-spacing: 0.05em;
    padding: 12px 20px;
    border-radius: 3px;
    z-index: 9999;
    max-width: 320px;
    text-align: center;
    backdrop-filter: blur(8px);
    transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.35s ease;
    opacity: 0;
    white-space: nowrap;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(-50%) translateY(0)';
      toast.style.opacity   = '1';
    });
  });

  // Animate out
  setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(80px)';
    toast.style.opacity   = '0';
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

// ============================================================
//  BUTTON LOADING STATE
// ============================================================
function setButtonLoading(btnId, textId, loaderId, loading = true) {
  const btn    = document.getElementById(btnId);
  const text   = document.getElementById(textId);
  const loader = document.getElementById(loaderId);

  if (!btn) return;

  if (loading) {
    btn.disabled             = true;
    if (text)   text.style.display   = 'none';
    if (loader) loader.style.display = 'block';
    btn.style.opacity        = '0.85';
  } else {
    btn.disabled             = false;
    if (text)   text.style.display   = 'inline';
    if (loader) loader.style.display = 'none';
    btn.style.opacity        = '1';
  }
}

// ============================================================
//  INPUT FIELD — Error / Success State
// ============================================================
function setInputState(inputId, state = 'normal', message = '') {
  const input  = document.getElementById(inputId);
  const errEl  = document.getElementById(`${inputId}-error`);

  if (!input) return;

  input.classList.remove('error', 'success');

  if (state === 'error') {
    input.classList.add('error');
    if (errEl) { errEl.textContent = message; errEl.style.display = 'block'; }
  } else if (state === 'success') {
    input.style.borderColor = 'var(--safe)';
    if (errEl) { errEl.style.display = 'none'; }
  } else {
    input.style.borderColor = '';
    if (errEl) { errEl.style.display = 'none'; }
  }
}

// ============================================================
//  ANIMATED COUNTER (Numbers count up visually)
// ============================================================
function animateCounter(elementId, targetValue, duration = 1200, prefix = '', suffix = '') {
  const el = document.getElementById(elementId);
  if (!el) return;

  const start     = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed  = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(start + (targetValue - start) * eased);

    el.textContent = prefix + value.toLocaleString('en-IN') + suffix;

    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = prefix + targetValue.toLocaleString('en-IN') + suffix;
  }

  requestAnimationFrame(update);
}

// ============================================================
//  SCROLL REVEAL — Elements fade in when scrolled into view
// ============================================================
function initScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity   = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.scroll-reveal').forEach(el => {
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(24px)';
    el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
    observer.observe(el);
  });
}

// ============================================================
//  PROBABILITY METER ANIMATION
// ============================================================
function animateProbabilityBar(fillId, probability, color, delay = 400) {
  const fill = document.getElementById(fillId);
  if (!fill) return;

  fill.style.width = '0%';
  fill.style.background = color;
  fill.style.transition = 'width 1.4s cubic-bezier(0.34,1.1,0.64,1)';

  setTimeout(() => {
    fill.style.width = probability + '%';
  }, delay);
}

// ============================================================
//  PROGRESS BARS — Animate all at once
// ============================================================
function animateAllProgressBars(delay = 500) {
  setTimeout(() => {
    document.querySelectorAll('[data-progress]').forEach(el => {
      const target = el.getAttribute('data-progress');
      el.style.width = target + '%';
    });
  }, delay);
}

// ============================================================
//  NUMBER FORMAT — Indian style (1,00,000)
// ============================================================
function formatIndian(num) {
  return parseInt(num).toLocaleString('en-IN');
}

// ============================================================
//  COPY TO CLIPBOARD
// ============================================================
async function copyToClipboard(text, successMsg = 'Copied!') {
  try {
    await navigator.clipboard.writeText(text);
    showToast(successMsg, 'success');
    return true;
  } catch {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity  = '0';
    document.body.appendChild(ta);
    ta.focus(); ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast(successMsg, 'success');
    return true;
  }
}

// ============================================================
//  SHARE VIA WEB SHARE API (Mobile)
// ============================================================
async function shareResult(title, text, url) {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return true;
    } catch (err) {
      if (err.name !== 'AbortError') {
        // Fallback to copy
        copyToClipboard(url, '🔗 Link copied! Share it now.');
      }
      return false;
    }
  } else {
    // Desktop: copy link
    copyToClipboard(url, '🔗 Link copied! Share it now.');
    return false;
  }
}

// ============================================================
//  RIPPLE EFFECT on Buttons
// ============================================================
function addRippleEffect(buttonEl) {
  buttonEl.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    const rect   = this.getBoundingClientRect();
    const size   = Math.max(rect.width, rect.height);
    const x      = e.clientX - rect.left - size / 2;
    const y      = e.clientY - rect.top  - size / 2;

    ripple.style.cssText = `
      position: absolute;
      width: ${size}px; height: ${size}px;
      left: ${x}px; top: ${y}px;
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple-anim 0.5s ease-out forwards;
      pointer-events: none;
    `;

    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
}

// Ripple animation CSS injection
(function injectRippleCSS() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes ripple-anim {
      to { transform: scale(2.5); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
})();

// ============================================================
//  MOBILE DETECTION
// ============================================================
function isMobile() {
  return window.innerWidth <= 768 ||
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

// ============================================================
//  SECTION HIGHLIGHT on Radio Change
// ============================================================
function highlightSelectedRule() {
  document.querySelectorAll('input[name="rule"]').forEach(radio => {
    const label = radio.closest('label');
    if (!label) return;
    if (radio.checked) {
      label.style.borderColor = 'rgba(240,192,64,0.6)';
      label.style.background  = 'rgba(240,192,64,0.08)';
    } else {
      label.style.borderColor = 'rgba(200,181,96,0.2)';
      label.style.background  = 'var(--surface2)';
    }
  });
}

// ============================================================
//  FORM VALIDATION HELPERS
// ============================================================
function validatePhone(phone) {
  return /^\d{10}$/.test(phone.trim());
}

function validateName(name) {
  return name.trim().length >= 2;
}

function validateAge(age) {
  const a = parseInt(age);
  return a >= 16 && a <= 19;
}

function validateMarks(value, max) {
  const v = parseInt(value);
  return !isNaN(v) && v >= 0 && v <= max;
}

// ============================================================
//  PAGE LOADER (hide on load)
// ============================================================
function hidePageLoader() {
  const loader = document.getElementById('page-loader');
  if (loader) {
    loader.style.opacity    = '0';
    loader.style.transition = 'opacity 0.4s ease';
    setTimeout(() => loader.remove(), 400);
  }
}

// ============================================================
//  INIT — Auto-run on DOM ready
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  // Scroll reveal
  initScrollReveal();

  // Ripple on all buttons
  document.querySelectorAll('button').forEach(addRippleEffect);

  // Rule highlight init
  highlightSelectedRule();
  document.querySelectorAll('input[name="rule"]').forEach(r => {
    r.addEventListener('change', () => {
      highlightSelectedRule();
      // Re-trigger live score update
      if (typeof onInputChange === 'function') onInputChange();
    });
  });

  // Hide page loader
  hidePageLoader();
});

// ============================================================
//  EXPORT — Browser Global
// ============================================================
if (typeof window !== 'undefined') {
  window.NDAUI = {
    showToast,
    setButtonLoading,
    setInputState,
    animateCounter,
    animateProbabilityBar,
    animateAllProgressBars,
    copyToClipboard,
    shareResult,
    formatIndian,
    isMobile,
    validatePhone,
    validateName,
    validateAge,
    validateMarks,
    initScrollReveal,
    addRippleEffect,
    highlightSelectedRule,
  };
}