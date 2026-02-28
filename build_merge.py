import re

with open('index_head.html', 'r', encoding='utf-8') as f:
    form_html = f.read()

with open('index.html', 'r', encoding='utf-8') as f:
    result_html = f.read()

# Grab CSS from both
form_css = re.search(r'<style>(.*?)</style>', form_html, re.DOTALL).group(1)
result_css = re.search(r'<style>(.*?)</style>', result_html, re.DOTALL).group(1)

css = form_css + "\n" + result_css

# Background elements
bgs = """
  <div id="hud-bg"></div>
  <div id="scanline"></div>
  <div id="crt"></div>
  <div id="mglow"></div>
  <div id="radar-wrap">
    <div id="radar-sweep"><div class="radar-center"></div></div>
  </div>
  <div id="particles"></div>
"""

# Nav from result, but modified
nav = """
  <nav>
    <div style="display:flex;align-items:center;gap:12px;">
      <div class="nav-logo" onclick="showForm()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00ff88" stroke-width="2.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      </div>
      <div>
        <div class="nav-brand" data-text="NDA PREDICTOR">NDA PREDICTOR</div>
        <div class="hud-strip" id="nav-system-status">
          <span style="width:4px;height:4px;background:var(--green);border-radius:50%;box-shadow:0 0 4px var(--green);display:inline-block;margin-right:6px;"></span>SYSTEM ONLINE
        </div>
      </div>
    </div>

    <div style="display:flex;align-items:center;gap:10px;">
      <div class="hud-strip" id="live-clock">00:00:00</div>
      <div class="hero-badge" id="nav-badge">UPSC DATA 2020–24</div>
      <button class="btn-recalc" id="btn-recalc" style="display:none;" onclick="showForm()">← RECALCULATE</button>
    </div>
  </nav>
"""

# Form sections
hero_section = re.search(r'<section [^>]*>.*?</section>', form_html, re.DOTALL).group(0)
main_section = re.search(r'<main [^>]*>.*?</main>', form_html, re.DOTALL).group(0)

# Modal overlay
modal_match = re.search(r'<div class="modal-overlay[^>]*>.*?</div>\s*</div>', form_html, re.DOTALL)
modal_section = modal_match.group(0) if modal_match else ""

view_form = f'<div id="view-form">\n{hero_section}\n{main_section}\n{modal_section}\n</div>\n'

view_result = """
  <div id="view-result" style="display:none;">
    <main id="result-main"></main>
    <canvas id="share-canvas" width="1080" height="1080"></canvas>
  </div>
"""

# Grab JS
form_js_groups = re.findall(r'<script>(.*?)</script>', form_html, re.DOTALL)
form_js = form_js_groups[0]

res_js_groups = re.findall(r'<script>(.*?)</script>', result_html, re.DOTALL)
res_js = [js for js in res_js_groups if 'firebase' not in js.lower()][0]

# Modify submitLead replacing setTimeout
submit_replacement = """
      setTimeout(() => {
        window.u_name = name;
        window.u_math = cachedResult.mathScore;
        window.u_gat = cachedResult.gatScore;
        window.u_written = cachedResult.writtenScore;
        window.u_ssb = cachedResult.ssb;
        window.u_total = cachedResult.totalScore;
        window.u_airMin = cachedResult.airMin;
        window.u_airMax = cachedResult.airMax;
        window.u_prob = cachedResult.probability;
        window.u_tag = cachedResult.tag;
        window.u_color = cachedResult.color;
        window.u_sectOk = cachedResult.sectionalPassed;
        window.u_mathPass = cachedResult.mathPassed;
        window.u_gatPass = cachedResult.gatPassed;
        window.u_age = age;

        closeLeadModal();
        document.getElementById('modal-btn-text').style.display = 'block';
        document.getElementById('modal-loader').style.display = 'none';
        document.getElementById('modal-submit-btn').disabled = false;
        
        showResult();
      }, 1200);
"""
form_js = re.sub(r'setTimeout\(\(\) => \{.+?window\.location\.href.+?1200\);', submit_replacement, form_js, flags=re.DOTALL)

# Result JS URL PARAMS Replacement
params_replacement = """
  // GLOBALS FROM SUBMISSION
  window.u_name = window.u_name || 'Cadet';
  window.u_math = window.u_math || 0;
  window.u_gat = window.u_gat || 0;
  window.u_written = window.u_written || 0;
  window.u_ssb = window.u_ssb || 0;
  window.u_total = window.u_total || 0;
  window.u_airMin = window.u_airMin || 1001;
  window.u_airMax = window.u_airMax || 9999;
  window.u_prob = window.u_prob || 5;
  window.u_tag = window.u_tag || 'NOT SELECTED ❌';
  window.u_color = window.u_color || '#F44336';
  window.u_sectOk = window.u_sectOk || false;
  window.u_mathPass = window.u_mathPass || false;
  window.u_gatPass = window.u_gatPass || false;
  window.u_age = window.u_age || 17;

  function showForm() {
    document.getElementById('view-result').style.display = 'none';
    document.getElementById('view-form').style.display = 'block';
    
    // Only toggle if elements exist
    const btnRecalc = document.getElementById('btn-recalc');
    const navBadge = document.getElementById('nav-badge');
    if (btnRecalc) btnRecalc.style.display = 'none';
    if (navBadge) navBadge.style.display = 'inline-flex';
    
    document.getElementById('nav-system-status').innerHTML = '<span style="width:4px;height:4px;background:var(--green);border-radius:50%;box-shadow:0 0 4px var(--green);display:inline-block;margin-right:6px;"></span>SYSTEM ONLINE';
    window.scrollTo(0,0);
  }

  function showResult() {
    document.getElementById('view-form').style.display = 'none';
    document.getElementById('view-result').style.display = 'block';
    
    const btnRecalc = document.getElementById('btn-recalc');
    const navBadge = document.getElementById('nav-badge');
    if (btnRecalc) btnRecalc.style.display = 'block';
    if (navBadge) navBadge.style.display = 'none';
    
    document.getElementById('nav-system-status').innerHTML = '◆ RESULT TERMINAL';
    
    renderResult();
    window.scrollTo(0,0);
  }
"""

res_js = re.sub(r'const P\s*=\s*new URLSearchParams\(location\.search\);.*?const age\s*=\s*parseInt\(P\.get\(\'age\'\)\) \|\| 17;', params_replacement, res_js, flags=re.DOTALL)

# Replace variable usages locally
replace_variables = ['name', 'math', 'gat', 'written', 'ssb', 'total', 'airMin', 'airMax', 'prob', 'tag', 'color', 'sectOk', 'mathPass', 'gatPass', 'age']
for v in replace_variables:
    res_js = re.sub(r'(?<!\.)\b' + v + r'\b(?!\s*:)', f'window.u_{v}', res_js)

# Remove the initial renderResult call
res_js = res_js.replace('renderResult();\n', '// renderResult handled by state transition \n')

# Convert any 'index.html' inner links to showForm()
res_js = res_js.replace("window.location.href='index.html'", 'showForm()')

firebase_scripts = """
  <!-- Firebase + NDA Scripts -->
  <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
  <script src="assets/js/firebase-config.js"></script>
"""

final_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NDA Rank Predictor — Know Your AIR Before Results</title>
  <link rel="manifest" href="manifest.json" />
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
  <style>
{css}

  /* Some fixes to avoid duplicates messing things up */
  #particles-wrap {{ display: none; }} /* Using new #particles instead */
  #mouse-glow {{ display: none; }}     /* Using #mglow instead */
  #crt-overlay {{ display: none; }}    /* Using #crt instead */
  </style>
</head>
<body>
{bgs}
{nav}
{view_form}
{view_result}

<script>
{form_js}
{res_js}
</script>
{firebase_scripts}
</body>
</html>
"""

with open("index.html", "w", encoding="utf-8") as f:
    f.write(final_html)

print("Merged successfully!")
