# 🎖️ NDA Rank Predictor

India's most accurate NDA rank predictor — built on real UPSC data (2021–2025).

---

## 🚀 Live Demo
> Deploy on Vercel/Netlify → Share link in NDA WhatsApp groups → Leads aa jayenge

---

## 📁 Project Structure

```
nda-rank-predictor/
│
├── index.html                  ← Main form (Hero + Input + Lead Capture)
├── result.html                 ← Result page (AIR + Probability + Share Card)
│
├── admin/
│   └── dashboard.html          ← Admin leads panel (Password protected)
│
├── assets/
│   ├── js/
│   │   ├── calculator.js       ← Core rank logic (Math/GAT/AIR prediction)
│   │   ├── firebase-config.js  ← Firebase + localStorage leads save
│   │   └── ui-updates.js       ← Animations, toasts, helpers
│   └── images/
│       └── logo.png
│
└── data/
    ├── rank-matrix.json        ← AIR prediction bands
    ├── cutoff-trends.json      ← Year-wise UPSC cutoff data
    └── sectional-cutoff.json   ← Sectional + overall cutoff rules
```

---

## ⚙️ Firebase Setup (5 minutes)

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create project → **nda-rank-predictor**
3. Add Web App → Copy config
4. Paste config in `assets/js/firebase-config.js`
5. Enable **Firestore Database** → Start in test mode
6. Done! Leads auto-save hone lagenge

---

## 🧮 Calculation Formula

```
Math Score  = (Correct × 2.5) − (Wrong × 0.83)
GAT Score   = (Correct × 4.0) − (Wrong × 1.33)
Written     = Math + GAT  [out of 900]
Total       = Written + SSB  [out of 1800]
```

**Sectional Cutoff Rule:**
- Math minimum: **75 marks** (25% of 300) — standard years
- GAT minimum:  **150 marks** (25% of 600) — standard years
- Both must be cleared. Ek bhi fail = Disqualified.

---

## 📊 Historical Cutoff Data (UPSC Official)

| Exam       | Written /900 | Final /1800 |
|------------|-------------|-------------|
| NDA 1 2025 | 305         | 673         |
| NDA 2 2024 | 305         | 673         |
| NDA 1 2024 | 291         | 654         |
| NDA 2 2023 | 292         | 656         |
| NDA 1 2023 | 301         | 664         |
| NDA 2 2022 | 316         | 678         |
| NDA 1 2022 | 360         | 720         |
| NDA 2 2021 | 355         | 726         |
| NDA 1 2021 | 343         | 709         |

**5-Year Average:** Written ~318 | Final ~683
**Safe Target:** Written 360+ | Final 700+

---

## 🔐 Admin Dashboard

- URL: `/admin/dashboard.html`
- Default password: `admin123`
- **Change password** in `dashboard.html` → `const ADMIN_PASS`

**Dashboard Features:**
- Total leads, today's leads, qualified count
- Search + filter by probability/sectional
- CSV export (one click)
- Charts: score distribution, probability split, daily signups
- AIR band distribution

---

## 💰 Monetization Plan

1. **Lead Capture** — Name + Phone collected before result shown
2. **CSV Export** — Sell leads to NDA coaching institutes
3. **Ad Slots** — Add coaching banners in `index.html` and `result.html`
4. **Admin Demo** — Show coaching owner the dashboard live

**Coaching Pitch Script:**
> "Sir, ye tool last month mein 2,000+ NDA aspirants ne use kiya. Unka naam, phone number, aur exact marks hamare paas hai. Aap inhe directly call karke apna coaching enroll kara sakte ho."

---

## 🌐 Deployment (Free)

**Option 1 — Vercel (Recommended):**
```bash
npm i -g vercel
vercel --prod
```

**Option 2 — Netlify:**
- Drag & drop folder on [netlify.com/drop](https://netlify.com/drop)

**Option 3 — GitHub Pages:**
- Push to GitHub → Settings → Pages → Deploy

---

## 📱 WhatsApp Marketing Strategy

1. Deploy karo → Link milega
2. NDA WhatsApp groups mein share karo:
   > *"🎯 Free NDA Rank Predictor — Apna AIR pata karo result se pehle! Real UPSC data pe based. → [LINK]"*
3. Result share card → Students WhatsApp status pe lagayenge → Free viral marketing
4. Leads aate rahenge automatically

---

## ⚠️ Disclaimer

This tool is based on historical UPSC NDA data and provides estimated predictions only.
It is **not an official UPSC tool**. Actual results may vary based on exam difficulty,
number of vacancies, and other factors decided by UPSC.

---

*Built with ❤️ for NDA aspirants | Data source: UPSC Official Merit Lists 2021–2025*