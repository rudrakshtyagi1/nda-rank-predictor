// ============================================================
//  share-card.js — Canvas API Share Card Generator
//  Personalized 1080×1080 image for WhatsApp/Instagram
// ============================================================

const ShareCard = {

  // ── Config ────────────────────────────────
  WIDTH:  1080,
  HEIGHT: 1080,

  COLORS: {
    bg:      '#0d0f0a',
    surface: '#161a10',
    gold:    '#f0c040',
    khaki:   '#c8b560',
    safe:    '#52b788',
    danger:  '#e63946',
    text:    '#e8e4d0',
    muted:   '#7a7a65',
  },

  // ── Main Generator ────────────────────────
  generate(data) {
    const {
      name = 'Cadet', airMin = 1, airMax = 100,
      written = 0, ssb = 0, total = 0,
      probability = 95, tag = 'EXCELLENT 🌟',
      color = '#f0c040', sectionalPassed = true,
    } = data;

    const canvas = document.getElementById('share-canvas');
    if (!canvas) {
      console.error('share-canvas element not found!');
      return null;
    }

    canvas.width  = this.WIDTH;
    canvas.height = this.HEIGHT;

    const ctx = canvas.getContext('2d');
    const W   = this.WIDTH;
    const H   = this.HEIGHT;

    // ── 1. Background ─────────────────────
    ctx.fillStyle = this.COLORS.bg;
    ctx.fillRect(0, 0, W, H);

    // ── 2. Grid Pattern ───────────────────
    ctx.strokeStyle = 'rgba(192,178,96,0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= W; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y <= H; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // ── 3. Background Glow ────────────────
    const grd = ctx.createRadialGradient(W * 0.5, H * 0.35, 0, W * 0.5, H * 0.35, 400);
    grd.addColorStop(0, color + '22');
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);

    // ── 4. Top Gold Bar ───────────────────
    const topBar = ctx.createLinearGradient(0, 0, W, 0);
    topBar.addColorStop(0, 'transparent');
    topBar.addColorStop(0.5, this.COLORS.gold);
    topBar.addColorStop(1, 'transparent');
    ctx.fillStyle = topBar;
    ctx.fillRect(0, 0, W, 4);

    // ── 5. Corner Marks ───────────────────
    this._drawCornerMark(ctx, 40, 40, 'tl');
    this._drawCornerMark(ctx, W - 40, 40, 'tr');
    this._drawCornerMark(ctx, 40, H - 40, 'bl');
    this._drawCornerMark(ctx, W - 40, H - 40, 'br');

    // ── 6. Brand Header ───────────────────
    ctx.textAlign    = 'center';
    ctx.fillStyle    = 'rgba(200,181,96,0.5)';
    ctx.font         = '500 26px "JetBrains Mono", monospace';
    ctx.letterSpacing = '0.2em';
    ctx.fillText('NDA RANK PREDICTOR', W / 2, 90);

    // ── 7. Candidate Name ─────────────────
    ctx.fillStyle    = this.COLORS.text;
    ctx.font         = 'bold 52px "Rajdhani", sans-serif';
    ctx.letterSpacing = '0.05em';
    ctx.fillText(name.toUpperCase(), W / 2, 180);

    // ── 8. AIR Label ─────────────────────
    ctx.fillStyle    = this.COLORS.muted;
    ctx.font         = '500 28px "JetBrains Mono", monospace';
    ctx.letterSpacing = '0.15em';
    ctx.fillText('PREDICTED ALL INDIA RANK', W / 2, 240);

    // ── 9. AIR Number ─────────────────────
    const airText = airMax >= 9999 ? '1000+' : `${airMin} – ${airMax}`;
    ctx.fillStyle    = color;
    ctx.font         = 'bold 180px "Rajdhani", sans-serif';
    ctx.letterSpacing = '0.02em';
    ctx.fillText(airText, W / 2, 440);

    // ── 10. Tag ───────────────────────────
    ctx.fillStyle    = this.COLORS.text;
    ctx.font         = 'bold 48px "Rajdhani", sans-serif';
    ctx.letterSpacing = '0.06em';
    ctx.fillText(tag, W / 2, 510);

    // ── 11. Score Box ─────────────────────
    this._roundRect(ctx, 100, 550, W - 200, 160, 8);
    ctx.fillStyle = 'rgba(30,36,22,0.9)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(200,181,96,0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Score values inside box
    const scoreItems = [
      { label: 'MATH',    value: data.math || 0,    max: 300,  x: 200 },
      { label: 'GAT',     value: data.gat  || 0,    max: 600,  x: 400 },
      { label: 'WRITTEN', value: written,            max: 900,  x: 620 },
      { label: 'TOTAL',   value: total,              max: 1800, x: 880 },
    ];

    scoreItems.forEach(item => {
      ctx.textAlign = 'center';
      ctx.fillStyle = this.COLORS.gold;
      ctx.font      = 'bold 38px "JetBrains Mono", monospace';
      ctx.fillText(item.value, item.x, 625);

      ctx.fillStyle = this.COLORS.muted;
      ctx.font      = '400 18px "JetBrains Mono", monospace';
      ctx.fillText(item.label, item.x, 655);

      ctx.fillStyle = 'rgba(200,181,96,0.25)';
      ctx.font      = '400 14px "JetBrains Mono", monospace';
      ctx.fillText(`/${item.max}`, item.x, 675);
    });

    // ── 12. Probability Bar ───────────────
    const BAR_X = 100, BAR_Y = 740, BAR_W = W - 200, BAR_H = 16;

    // Background
    this._roundRect(ctx, BAR_X, BAR_Y, BAR_W, BAR_H, BAR_H / 2);
    ctx.fillStyle = '#1e2416';
    ctx.fill();

    // Fill
    const fillW = (BAR_W * probability) / 100;
    if (fillW > 0) {
      this._roundRect(ctx, BAR_X, BAR_Y, fillW, BAR_H, BAR_H / 2);
      ctx.fillStyle = color;
      ctx.fill();
    }

    // Probability text
    ctx.textAlign = 'left';
    ctx.fillStyle = this.COLORS.muted;
    ctx.font      = '400 20px "JetBrains Mono", monospace';
    ctx.fillText('Selection Probability', BAR_X, 800);

    ctx.textAlign = 'right';
    ctx.fillStyle = color;
    ctx.font      = 'bold 24px "JetBrains Mono", monospace';
    ctx.fillText(`${probability}%`, BAR_X + BAR_W, 800);

    // ── 13. Sectional Status ─────────────
    ctx.textAlign = 'center';
    const sectColor = sectionalPassed ? this.COLORS.safe : this.COLORS.danger;
    const sectText  = sectionalPassed ? '✓ Sectional Cutoff Cleared' : '✗ Sectional Cutoff Failed';
    ctx.fillStyle   = sectColor;
    ctx.font        = '600 22px "Rajdhani", sans-serif';
    ctx.fillText(sectText, W / 2, 850);

    // ── 14. Footer ────────────────────────
    ctx.fillStyle = 'rgba(122,122,101,0.45)';
    ctx.font      = '400 20px "JetBrains Mono", monospace';
    ctx.fillText('Based on UPSC NDA Data 2021–2025 · Not an official UPSC tool', W / 2, 920);

    ctx.fillStyle    = this.COLORS.gold;
    ctx.font         = 'bold 24px "Rajdhani", sans-serif';
    ctx.letterSpacing = '0.05em';
    ctx.fillText('Predict yours → nda-rank-predictor.vercel.app', W / 2, 960);

    // Bottom bar
    const botBar = ctx.createLinearGradient(0, 0, W, 0);
    botBar.addColorStop(0, 'transparent');
    botBar.addColorStop(0.5, this.COLORS.gold);
    botBar.addColorStop(1, 'transparent');
    ctx.fillStyle = botBar;
    ctx.fillRect(0, H - 4, W, 4);

    return canvas;
  },

  // ── Download as PNG ───────────────────────
  download(data) {
    const canvas = this.generate(data);
    if (!canvas) return;

    const fileName = `NDA_Rank_${(data.name || 'Result').replace(/\s+/g, '_')}.png`;

    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a   = document.createElement('a');
      a.href     = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Show success modal if exists
      if (typeof showModal === 'function') showModal('share-modal');

    }, 'image/png', 0.95);
  },

  // ── Share via Web Share API ───────────────
  async share(data) {
    const canvas = this.generate(data);
    if (!canvas) return;

    canvas.toBlob(async blob => {
      const file = new File([blob], 'NDA_Rank_Result.png', { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: `My NDA Predicted AIR: ${data.airMin}–${data.airMax}`,
            text: `I scored ${data.written}/900 in NDA Written! My predicted rank is AIR ${data.airMin}–${data.airMax} with ${data.probability}% selection probability. Check yours!`,
            files: [file],
          });
        } catch (err) {
          if (err.name !== 'AbortError') this.download(data);
        }
      } else {
        // Fallback: download
        this.download(data);
      }
    }, 'image/png');
  },

  // ── Helper: Rounded Rect ─────────────────
  _roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  },

  // ── Helper: Corner Marks ─────────────────
  _drawCornerMark(ctx, x, y, pos) {
    const S = 28;
    ctx.strokeStyle = 'rgba(200,181,96,0.25)';
    ctx.lineWidth   = 1.5;
    ctx.beginPath();

    if (pos === 'tl') { ctx.moveTo(x, y + S); ctx.lineTo(x, y); ctx.lineTo(x + S, y); }
    if (pos === 'tr') { ctx.moveTo(x - S, y); ctx.lineTo(x, y); ctx.lineTo(x, y + S); }
    if (pos === 'bl') { ctx.moveTo(x, y - S); ctx.lineTo(x, y); ctx.lineTo(x + S, y); }
    if (pos === 'br') { ctx.moveTo(x - S, y); ctx.lineTo(x, y); ctx.lineTo(x, y - S); }

    ctx.stroke();
  },
};

// ── Export ────────────────────────────────────
if (typeof window !== 'undefined') {
  window.ShareCard = ShareCard;
}