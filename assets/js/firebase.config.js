// ============================================================
//  firebase-config.js — Firebase Setup + Leads Save Karna
//  
//  SETUP STEPS:
//  1. Go to https://console.firebase.google.com
//  2. Create new project → "nda-rank-predictor"
//  3. Add Web App → Copy config below
//  4. Enable Firestore Database (Start in test mode)
//  5. Replace the firebaseConfig object below with your config
// ============================================================

// ── YOUR FIREBASE CONFIG (Replace with yours) ──────────────
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};

// ── Firebase SDKs (v9 Compat Mode) ─────────────────────────
// Add these script tags in your HTML before this file:
//
// <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics-compat.js"></script>

// ── Initialize ──────────────────────────────────────────────
let db         = null;
let analytics  = null;
let firebaseOk = false;

function initFirebase() {
  try {
    if (typeof firebase === 'undefined') {
      console.warn('Firebase SDK not loaded. Using localStorage fallback.');
      return false;
    }

    // Prevent double init
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    db         = firebase.firestore();
    analytics  = firebase.analytics();
    firebaseOk = true;
    console.log('✅ Firebase connected!');
    return true;
  } catch (err) {
    console.error('Firebase init failed:', err);
    firebaseOk = false;
    return false;
  }
}

// ============================================================
//  SAVE LEAD
//  Tries Firebase first → falls back to localStorage
// ============================================================
async function saveLead(leadData) {
  const lead = {
    name:            leadData.name         || '',
    phone:           leadData.phone        || '',
    age:             leadData.age          || 0,
    mathScore:       leadData.mathScore    || 0,
    gatScore:        leadData.gatScore     || 0,
    writtenScore:    leadData.writtenScore || 0,
    ssb:             leadData.ssb          || 0,
    totalScore:      leadData.totalScore   || 0,
    airMin:          leadData.airMin       || 0,
    airMax:          leadData.airMax       || 0,
    probability:     leadData.probability  || 0,
    tag:             leadData.tag          || '',
    sectionalPassed: leadData.sectionalPassed ?? false,
    mathPassed:      leadData.mathPassed   ?? false,
    gatPassed:       leadData.gatPassed    ?? false,
    source:          'nda-predictor-web',
    timestamp:       new Date().toISOString(),
    userAgent:       navigator.userAgent.substring(0, 100),
  };

  // ── 1. Always save to localStorage (instant, offline-safe) ──
  saveToLocalStorage(lead);

  // ── 2. Also save to Firebase if connected ──────────────────
  if (firebaseOk && db) {
    try {
      await db.collection('leads').add(lead);
      console.log('✅ Lead saved to Firebase:', lead.name);

      // Log analytics event
      if (analytics) {
        analytics.logEvent('rank_predicted', {
          written_score: lead.writtenScore,
          probability:   lead.probability,
          sectional_ok:  lead.sectionalPassed,
        });
      }

      return { success: true, source: 'firebase' };
    } catch (err) {
      console.error('Firestore save failed, localStorage used:', err);
      return { success: true, source: 'localStorage', error: err.message };
    }
  }

  return { success: true, source: 'localStorage' };
}

// ── localStorage Helper ─────────────────────────────────────
function saveToLocalStorage(lead) {
  try {
    const existing = JSON.parse(localStorage.getItem('nda_leads') || '[]');
    existing.push(lead);
    localStorage.setItem('nda_leads', JSON.stringify(existing));
  } catch (err) {
    console.error('localStorage save failed:', err);
  }
}

// ============================================================
//  GET ALL LEADS (Admin Dashboard ke liye)
// ============================================================
async function getAllLeads() {
  // ── From Firebase ──────────────────────────────────────────
  if (firebaseOk && db) {
    try {
      const snap = await db.collection('leads')
        .orderBy('timestamp', 'desc')
        .limit(500)
        .get();

      const leads = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log(`✅ ${leads.length} leads fetched from Firebase`);

      // Sync to localStorage for offline access
      localStorage.setItem('nda_leads', JSON.stringify(leads));
      return leads;
    } catch (err) {
      console.error('Firestore fetch failed, using localStorage:', err);
    }
  }

  // ── Fallback: localStorage ─────────────────────────────────
  const local = JSON.parse(localStorage.getItem('nda_leads') || '[]');
  return local.reverse();
}

// ============================================================
//  DELETE LEAD (Admin ke liye)
// ============================================================
async function deleteLead(leadId) {
  if (firebaseOk && db && leadId) {
    try {
      await db.collection('leads').doc(leadId).delete();
      console.log('Lead deleted from Firebase:', leadId);
    } catch (err) {
      console.error('Firebase delete failed:', err);
    }
  }

  // Remove from localStorage too
  const leads = JSON.parse(localStorage.getItem('nda_leads') || '[]');
  const filtered = leads.filter(l => l.id !== leadId);
  localStorage.setItem('nda_leads', JSON.stringify(filtered));
}

// ============================================================
//  GET ANALYTICS SUMMARY (Admin Dashboard Stats)
// ============================================================
async function getAnalyticsSummary() {
  const leads = await getAllLeads();

  const today      = new Date().toDateString();
  const todayCount = leads.filter(l => new Date(l.timestamp).toDateString() === today).length;

  const qualified  = leads.filter(l => (l.writtenScore || 0) >= 291);
  const highProb   = leads.filter(l => (l.probability  || 0) >= 80);

  const avgWritten = leads.length
    ? Math.round(leads.reduce((s, l) => s + (l.writtenScore || 0), 0) / leads.length)
    : 0;

  const avgTotal = leads.length
    ? Math.round(leads.reduce((s, l) => s + (l.totalScore || 0), 0) / leads.length)
    : 0;

  // Last 7 days daily counts
  const dailyCounts = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toDateString();
    return {
      date:  d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
      count: leads.filter(l => new Date(l.timestamp).toDateString() === dayStr).length,
    };
  });

  return {
    total:       leads.length,
    today:       todayCount,
    qualified:   qualified.length,
    qualPct:     leads.length ? Math.round((qualified.length / leads.length) * 100) : 0,
    highProb:    highProb.length,
    avgWritten,
    avgTotal,
    dailyCounts,
    leads,
  };
}

// ============================================================
//  ADMIN AUTH (Simple — upgrade to Firebase Auth later)
// ============================================================
const ADMIN_PASSWORD = 'nda@admin2025'; // Change this!

function adminLogin(password) {
  if (password === ADMIN_PASSWORD) {
    sessionStorage.setItem('nda_admin_auth', btoa(password));
    return true;
  }
  return false;
}

function isAdminLoggedIn() {
  const stored = sessionStorage.getItem('nda_admin_auth');
  return stored && atob(stored) === ADMIN_PASSWORD;
}

function adminLogout() {
  sessionStorage.removeItem('nda_admin_auth');
}

// ============================================================
//  EXPORT — Browser Global
// ============================================================
if (typeof window !== 'undefined') {
  window.NDAFirebase = {
    init:               initFirebase,
    saveLead,
    getAllLeads,
    deleteLead,
    getAnalyticsSummary,
    adminLogin,
    isAdminLoggedIn,
    adminLogout,
    saveToLocalStorage,
  };

  // Auto-init on load
  document.addEventListener('DOMContentLoaded', initFirebase);
}