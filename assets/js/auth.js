// ============================================================
//  auth.js — Admin Login / Logout / Session Management
//  Used in admin/login.html and all admin pages
// ============================================================

const NDAAuth = {

  // ── Config ────────────────────────────────
  PASSWORD:       'admin123',       // Change this before deploy!
  SESSION_KEY:    'nda_admin',
  MAX_ATTEMPTS:   3,
  LOCKOUT_SECS:   30,

  // ── State ─────────────────────────────────
  attempts:   0,
  isLocked:   false,
  lockTimer:  null,

  // ── Check if logged in ─────────────────────
  isLoggedIn() {
    return sessionStorage.getItem(this.SESSION_KEY) === '1';
  },

  // ── Login ─────────────────────────────────
  login(password) {
    if (this.isLocked) {
      return { success: false, error: 'Account locked. Try again later.' };
    }

    if (!password) {
      return { success: false, error: '⚠ Password required' };
    }

    if (password === this.PASSWORD) {
      sessionStorage.setItem(this.SESSION_KEY, '1');
      this.attempts = 0;
      return { success: true };
    }

    // Wrong password
    this.attempts++;
    const remaining = this.MAX_ATTEMPTS - this.attempts;

    if (this.attempts >= this.MAX_ATTEMPTS) {
      this._startLockout();
      return { success: false, error: 'Too many attempts. Account locked.', locked: true };
    }

    return {
      success: false,
      error: `✗ Wrong password · ${remaining} attempt${remaining === 1 ? '' : 's'} left`,
      attemptsUsed: this.attempts,
    };
  },

  // ── Logout ────────────────────────────────
  logout() {
    sessionStorage.removeItem(this.SESSION_KEY);
    window.location.href = 'login.html';
  },

  // ── Require Auth (call on protected pages) ─
  requireAuth(redirectTo = 'login.html') {
    if (!this.isLoggedIn()) {
      window.location.href = redirectTo;
      return false;
    }
    return true;
  },

  // ── Lockout Timer ────────────────────────
  _startLockout() {
    this.isLocked = true;
    let remaining = this.LOCKOUT_SECS;

    // Show lockout overlay if exists
    const overlay = document.getElementById('lockout-overlay');
    if (overlay) overlay.style.display = 'flex';

    // Disable login button
    const btn = document.getElementById('login-btn');
    if (btn) btn.disabled = true;

    this.lockTimer = setInterval(() => {
      remaining--;
      const timerEl = document.getElementById('lockout-timer');
      if (timerEl) timerEl.textContent = remaining;

      if (remaining <= 0) {
        clearInterval(this.lockTimer);
        this.isLocked = false;
        this.attempts = 0;

        if (overlay) overlay.style.display = 'none';
        if (btn) btn.disabled = false;

        // Reset attempt dots
        for (let i = 1; i <= this.MAX_ATTEMPTS; i++) {
          const dot = document.getElementById(`dot-${i}`);
          if (dot) dot.classList.remove('used');
        }

        // Focus input
        document.getElementById('password-input')?.focus();
      }
    }, 1000);
  },

  // ── Mark Attempt Dot ─────────────────────
  markAttemptDot(n) {
    const dot = document.getElementById(`dot-${n}`);
    if (dot) dot.classList.add('used');
  },

  // ── Toggle Password Visibility ────────────
  togglePassword() {
    const inp = document.getElementById('password-input');
    const btn = document.getElementById('toggle-btn');
    if (!inp) return;

    if (inp.type === 'password') {
      inp.type = 'text';
      if (btn) btn.textContent = '🙈';
    } else {
      inp.type = 'password';
      if (btn) btn.textContent = '👁';
    }
  },

  // ── Set Status Message ───────────────────
  setStatus(msg, color = 'var(--muted)') {
    const el = document.getElementById('status-msg');
    if (el) {
      el.textContent = msg;
      el.style.color = color;
    }
  },

  // ── Set Button Loading ───────────────────
  setLoading(loading) {
    const btn    = document.getElementById('login-btn');
    const txt    = document.getElementById('btn-text');
    const loader = document.getElementById('btn-loader');

    if (btn)    btn.disabled          = loading;
    if (txt)    txt.style.display     = loading ? 'none'  : 'inline';
    if (loader) loader.style.display  = loading ? 'flex'  : 'none';
  },

  // ── Shake Input ──────────────────────────
  shakeInput() {
    const inp = document.getElementById('password-input');
    if (!inp) return;
    inp.classList.add('error');
    inp.value = '';
    setTimeout(() => inp.classList.remove('error'), 600);
  },

  // ── Handle Login Flow ─────────────────────
  // Called from login.html on button click / enter key
  async handleLoginClick() {
    const pass = document.getElementById('password-input')?.value || '';

    this.setStatus('');
    this.setLoading(true);

    // Simulate small delay for UX
    await new Promise(r => setTimeout(r, 800));

    const result = this.login(pass);

    if (result.success) {
      this.setStatus('✓ Access Granted! Redirecting...', 'var(--safe)');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 700);
    } else {
      this.setLoading(false);
      this.shakeInput();

      if (result.attemptsUsed) {
        this.markAttemptDot(result.attemptsUsed);
      }

      this.setStatus(result.error, result.locked ? 'var(--danger)' : 'var(--danger)');
    }
  },
};

// ── Login Page Init ──────────────────────────
function initLoginPage() {
  // Auto-redirect if already logged in
  if (NDAAuth.isLoggedIn()) {
    window.location.href = 'dashboard.html';
    return;
  }

  // Enter key support
  document.getElementById('password-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') NDAAuth.handleLoginClick();
  });

  // Clear error on type
  document.getElementById('password-input')?.addEventListener('input', () => {
    NDAAuth.setStatus('');
    document.getElementById('password-input')?.classList.remove('error');
  });

  // Focus on load
  setTimeout(() => {
    document.getElementById('password-input')?.focus();
  }, 700);
}

// ── Protected Page Init ──────────────────────
function requireAdminAuth() {
  NDAAuth.requireAuth('login.html');
}

// ── Logout helper (call from any admin page) ──
function logout() {
  NDAAuth.logout();
}

// ── Export ────────────────────────────────────
if (typeof window !== 'undefined') {
  window.NDAAuth = NDAAuth;
  window.initLoginPage = initLoginPage;
  window.requireAdminAuth = requireAdminAuth;
  window.logout = logout;
}