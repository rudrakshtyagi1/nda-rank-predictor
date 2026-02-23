// ============================================================
//  admin.js — Dashboard Leads Fetch + Table Render
//  Used in admin/dashboard.html
// ============================================================

const AdminDashboard = {

  leads:       [],
  filtered:    [],
  sortCol:     'timestamp',
  sortDir:     'desc',
  currentPage: 1,
  perPage:     25,

  // ── Init ───────────────────────────────
  async init() {
    this.leads    = await this.fetchLeads();
    this.filtered = [...this.leads];
    this.renderStats();
    this.renderTable();
    this.renderRecentTable();
    this.startAutoRefresh();
  },

  // ── Fetch from Firebase or localStorage ──
  async fetchLeads() {
    // Try Firebase first (if NDAFirebase is loaded)
    if (window.NDAFirebase && window.NDAFirebase.init) {
      try {
        const leads = await window.NDAFirebase.getAllLeads();
        if (leads && leads.length) return leads;
      } catch (e) {
        console.warn('Firebase fetch failed, using localStorage:', e);
      }
    }
    // Fallback: localStorage
    return JSON.parse(localStorage.getItem('nda_leads') || '[]').reverse();
  },

  // ── Stats Cards ─────────────────────────
  renderStats() {
    const leads    = this.leads;
    const today    = new Date().toDateString();
    const todayL   = leads.filter(l => new Date(l.timestamp).toDateString() === today);
    const qualified = leads.filter(l => (l.writtenScore || 0) >= 291);
    const highProb  = leads.filter(l => (l.probability  || 0) >= 80);
    const avgW      = leads.length
      ? Math.round(leads.reduce((s, l) => s + (l.writtenScore || 0), 0) / leads.length)
      : 0;

    this._set('stat-total',     leads.length);
    this._set('stat-today',     `+${todayL.length} today`);
    this._set('stat-qualified', qualified.length);
    this._set('stat-qual-pct',  leads.length ? `${Math.round((qualified.length / leads.length) * 100)}% pass rate` : '0%');
    this._set('stat-avg',       avgW || '—');
    this._set('stat-hot',       highProb.length);
    this._set('last-updated',   `Updated: ${new Date().toLocaleTimeString()}`);
  },

  // ── Recent Table (overview tab) ─────────
  renderRecentTable() {
    const tbody = document.getElementById('recent-tbody');
    if (!tbody) return;

    const recent = this.leads.slice(0, 5);
    if (!recent.length) {
      tbody.innerHTML = `<tr><td colspan="7" class="table-empty">No leads yet. Share the predictor!</td></tr>`;
      return;
    }

    tbody.innerHTML = recent.map(l => `
      <tr>
        <td class="font-ui">${l.name || '—'}</td>
        <td class="font-mono" style="color:var(--gold)">${l.phone || '—'}</td>
        <td class="font-mono">${l.writtenScore || 0}</td>
        <td class="font-mono">${l.totalScore   || 0}</td>
        <td class="font-mono" style="color:var(--gold);font-size:12px">
          ${l.airMin && l.airMax ? `${l.airMin}–${l.airMax}` : '—'}
        </td>
        <td>${this._probBadge(l.probability || 0)}</td>
        <td class="font-mono" style="color:var(--muted);font-size:11px">${this._timeAgo(l.timestamp)}</td>
      </tr>
    `).join('');
  },

  // ── Full Leads Table ─────────────────────
  renderTable() {
    const tbody = document.getElementById('all-leads-tbody');
    if (!tbody) return;

    // Pagination
    const start   = (this.currentPage - 1) * this.perPage;
    const pageData = this.filtered.slice(start, start + this.perPage);

    this._set('showing-count', pageData.length);
    this._set('total-count',   this.filtered.length);

    if (!pageData.length) {
      tbody.innerHTML = `<tr><td colspan="13" class="table-empty">No leads found.</td></tr>`;
      this.renderPagination();
      return;
    }

    tbody.innerHTML = pageData.map((l, i) => `
      <tr>
        <td class="font-mono" style="color:var(--muted);font-size:11px">${start + i + 1}</td>
        <td class="font-ui">${l.name  || '—'}</td>
        <td class="font-mono" style="color:var(--gold)">${l.phone || '—'}</td>
        <td class="font-mono">${l.age  || '—'}</td>
        <td class="font-mono">${l.mathScore    || 0}</td>
        <td class="font-mono">${l.gatScore     || 0}</td>
        <td class="font-mono">${l.writtenScore || 0}</td>
        <td class="font-mono">${l.ssb          || 0}</td>
        <td class="font-mono" style="font-weight:700;color:var(--text)">${l.totalScore || 0}</td>
        <td class="font-mono" style="color:var(--gold);font-size:11px">
          ${l.airMin && l.airMax ? `${l.airMin}–${l.airMax}` : '—'}
        </td>
        <td>${this._probBadge(l.probability || 0)}</td>
        <td>${this._sectBadge(l.sectionalPassed)}</td>
        <td class="font-mono" style="color:var(--muted);font-size:11px">${this._formatDate(l.timestamp)}</td>
      </tr>
    `).join('');

    this.renderPagination();
  },

  // ── Pagination ───────────────────────────
  renderPagination() {
    const totalPages = Math.ceil(this.filtered.length / this.perPage);
    const el = document.getElementById('pagination');
    if (!el) return;

    if (totalPages <= 1) { el.innerHTML = ''; return; }

    el.innerHTML = `
      <button onclick="AdminDashboard.goPage(${this.currentPage - 1})"
        ${this.currentPage <= 1 ? 'disabled' : ''}
        class="btn-ghost" style="padding:6px 14px; font-size:13px;">← Prev</button>
      <span class="font-mono text-xs" style="color:var(--muted);padding:0 12px">
        Page ${this.currentPage} of ${totalPages}
      </span>
      <button onclick="AdminDashboard.goPage(${this.currentPage + 1})"
        ${this.currentPage >= totalPages ? 'disabled' : ''}
        class="btn-ghost" style="padding:6px 14px; font-size:13px;">Next →</button>
    `;
  },

  goPage(page) {
    const totalPages = Math.ceil(this.filtered.length / this.perPage);
    if (page < 1 || page > totalPages) return;
    this.currentPage = page;
    this.renderTable();
    document.getElementById('all-leads-tbody')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  // ── Search & Filter ──────────────────────
  filter() {
    const query = (document.getElementById('search-input')?.value || '').toLowerCase();
    const prob  = document.getElementById('filter-prob')?.value || '';
    const sect  = document.getElementById('filter-sect')?.value || '';

    this.filtered = this.leads.filter(l => {
      const matchQ = !query ||
        (l.name  || '').toLowerCase().includes(query) ||
        (l.phone || '').includes(query);

      const p = l.probability || 0;
      const matchP = !prob ||
        (prob === 'high' && p >= 80) ||
        (prob === 'mid'  && p >= 40 && p < 80) ||
        (prob === 'low'  && p < 40);

      const matchS = !sect ||
        (sect === '1' && l.sectionalPassed) ||
        (sect === '0' && !l.sectionalPassed);

      return matchQ && matchP && matchS;
    });

    this.currentPage = 1;
    this.renderTable();
  },

  // ── Sort ─────────────────────────────────
  sort(col) {
    if (this.sortCol === col) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortCol = col;
      this.sortDir = 'desc';
    }

    this.filtered.sort((a, b) => {
      const va = a[col] ?? '';
      const vb = b[col] ?? '';
      const cmp = typeof va === 'number'
        ? va - vb
        : String(va).localeCompare(String(vb));
      return this.sortDir === 'asc' ? cmp : -cmp;
    });

    // Update header indicators
    document.querySelectorAll('.leads-table th').forEach(th => {
      th.classList.remove('sort-asc', 'sort-desc');
    });

    this.renderTable();
  },

  // ── Export CSV ───────────────────────────
  exportCSV() {
    const leads = this.filtered.length ? this.filtered : this.leads;
    if (!leads.length) { alert('No leads to export!'); return; }

    const headers = ['#','Name','Phone','Age','Math','GAT','Written','SSB','Total','AIR Min','AIR Max','Probability%','Sectional','Date'];
    const rows = leads.map((l, i) => [
      i + 1, l.name, l.phone, l.age,
      l.mathScore, l.gatScore, l.writtenScore, l.ssb, l.totalScore,
      l.airMin, l.airMax, l.probability,
      l.sectionalPassed ? 'Cleared' : 'Failed',
      this._formatDate(l.timestamp),
    ].map(v => `"${v ?? ''}"`).join(','));

    const csv  = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `NDA_Leads_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // ── Clear All ────────────────────────────
  async clearAll() {
    if (!confirm('Delete ALL leads permanently? This cannot be undone!')) return;
    localStorage.removeItem('nda_leads');
    this.leads    = [];
    this.filtered = [];
    this.renderStats();
    this.renderTable();
    this.renderRecentTable();
  },

  // ── Auto Refresh every 60s ───────────────
  startAutoRefresh() {
    setInterval(async () => {
      this.leads    = await this.fetchLeads();
      this.filtered = [...this.leads];
      this.renderStats();
      this.renderRecentTable();
    }, 60000);
  },

  // ── Helpers ──────────────────────────────
  _set(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  },

  _probBadge(p) {
    if (p >= 88) return `<span class="badge badge-green">${p}%</span>`;
    if (p >= 55) return `<span class="badge badge-gold">${p}%</span>`;
    if (p >= 25) return `<span class="badge badge-orange">${p}%</span>`;
    return `<span class="badge badge-red">${p}%</span>`;
  },

  _sectBadge(passed) {
    return passed
      ? `<span class="badge badge-green">CLEAR ✓</span>`
      : `<span class="badge badge-red">FAIL ✗</span>`;
  },

  _timeAgo(ts) {
    if (!ts) return '—';
    const diff = Date.now() - new Date(ts).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return 'Just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  },

  _formatDate(ts) {
    if (!ts) return '—';
    return new Date(ts).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });
  },
};

// ── Auto-init on DOM ready ────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Auth check
  if (sessionStorage.getItem('nda_admin') !== '1') {
    window.location.href = 'login.html';
    return;
  }
  AdminDashboard.init();
});

// ── Export ────────────────────────────────────
if (typeof window !== 'undefined') {
  window.AdminDashboard = AdminDashboard;
}