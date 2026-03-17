// ─── Hotspot Login Page Templates ────────────────────────────

export interface LoginTemplate {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  colors: { bg: string; card: string; accent: string };
}

export const LOGIN_TEMPLATES: LoginTemplate[] = [
  {
    id: "modern",
    name: "Modern",
    nameAr: "عصري",
    description: "Clean card with teal gradient",
    descriptionAr: "بطاقة نظيفة مع تدرج أزرق مخضر",
    colors: { bg: "#0891b2", card: "#ffffff", accent: "#0e7490" },
  },
  {
    id: "dark",
    name: "Dark Elegance",
    nameAr: "أناقة داكنة",
    description: "Dark theme with neon purple accents",
    descriptionAr: "تصميم داكن مع لمسات بنفسجية",
    colors: { bg: "#1e1b4b", card: "#312e81", accent: "#a78bfa" },
  },
  {
    id: "sunrise",
    name: "Sunrise",
    nameAr: "شروق",
    description: "Warm orange and golden tones",
    descriptionAr: "ألوان برتقالية وذهبية دافئة",
    colors: { bg: "#ea580c", card: "#ffffff", accent: "#f97316" },
  },
  {
    id: "ocean",
    name: "Ocean",
    nameAr: "المحيط",
    description: "Deep blue with wave-inspired design",
    descriptionAr: "أزرق عميق مستوحى من الأمواج",
    colors: { bg: "#1e3a5f", card: "#ffffff", accent: "#3b82f6" },
  },
  {
    id: "minimal",
    name: "Minimal",
    nameAr: "بسيط",
    description: "Pure white, ultra-clean design",
    descriptionAr: "تصميم أبيض نقي وبسيط جداً",
    colors: { bg: "#f8fafc", card: "#ffffff", accent: "#334155" },
  },
  {
    id: "forest",
    name: "Forest",
    nameAr: "الغابة",
    description: "Natural green tones",
    descriptionAr: "ألوان خضراء طبيعية",
    colors: { bg: "#166534", card: "#ffffff", accent: "#22c55e" },
  },
];

export function generateTemplateHTML(
  templateId: string,
  title: string,
  logoBase64?: string | null
): { html: string; css: string } {
  const logoHtml = logoBase64
    ? `<img src="${logoBase64}" alt="Logo" class="logo-img" />`
    : "";

  const titleHtml = title || "WiFi Hotspot";

  switch (templateId) {
    case "dark":
      return darkTemplate(titleHtml, logoHtml);
    case "sunrise":
      return sunriseTemplate(titleHtml, logoHtml);
    case "ocean":
      return oceanTemplate(titleHtml, logoHtml);
    case "minimal":
      return minimalTemplate(titleHtml, logoHtml);
    case "forest":
      return forestTemplate(titleHtml, logoHtml);
    default:
      return modernTemplate(titleHtml, logoHtml);
  }
}

function wrapHTML(body: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>WiFi Login</title>
</head>
<body>
${body}
<script>
(function(){
  try {
    var p = new URLSearchParams(window.location.search);
    var code = p.get('code');
    if (code) {
      var inp = document.querySelector('input[name="username"]');
      if (inp) { inp.value = code; inp.readOnly = true; inp.style.opacity = '0.8'; }
      var form = document.querySelector('form');
      if (form && form.action && form.action.indexOf('$(') === -1) {
        setTimeout(function(){ form.submit(); }, 500);
      }
    }
  } catch(e){}
})();
</script>
</body>
</html>`;
}

// ─── Template 1: Modern ─────────────────────────────────────
function modernTemplate(title: string, logoHtml: string) {
  const html = wrapHTML(`  <div class="container">
    ${logoHtml}
    <h1>${title}</h1>
    <p class="subtitle">Enter your voucher code to connect</p>
    <form method="post" action="$(link-login-only)">
      <input type="hidden" name="dst" value="$(link-orig)" />
      <input type="text" name="username" placeholder="Voucher Code" required />
      <input type="hidden" name="password" value="" />
      <button type="submit">Connect</button>
    </form>
    <p class="footer">Powered by NileLink</p>
  </div>`);

  const css = `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: 'Segoe UI', system-ui, sans-serif;
  background: linear-gradient(135deg, #0891b2, #0e7490, #155e75);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.container {
  background: #ffffff;
  border-radius: 24px;
  padding: 48px 40px;
  width: 100%;
  max-width: 420px;
  text-align: center;
  box-shadow: 0 25px 60px rgba(0,0,0,0.15);
}
.logo-img {
  width: 80px;
  height: 80px;
  object-fit: contain;
  margin-bottom: 16px;
  border-radius: 16px;
}
h1 { color: #0e7490; font-size: 26px; font-weight: 700; }
.subtitle { color: #64748b; margin-top: 8px; font-size: 14px; }
form { margin-top: 28px; }
input[type="text"] {
  width: 100%;
  padding: 14px 18px;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  font-size: 16px;
  text-align: center;
  letter-spacing: 2px;
  outline: none;
  transition: border-color 0.3s;
  background: #f8fafc;
}
input[type="text"]:focus { border-color: #0891b2; background: #fff; }
button {
  width: 100%;
  margin-top: 16px;
  padding: 14px;
  background: linear-gradient(135deg, #0891b2, #0e7490);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
button:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(8,145,178,0.3); }
.footer { margin-top: 28px; color: #94a3b8; font-size: 12px; }`;

  return { html, css };
}

// ─── Template 2: Dark Elegance ──────────────────────────────
function darkTemplate(title: string, logoHtml: string) {
  const html = wrapHTML(`  <div class="container">
    <div class="glow"></div>
    ${logoHtml}
    <h1>${title}</h1>
    <p class="subtitle">Enter your voucher code</p>
    <form method="post" action="$(link-login-only)">
      <input type="hidden" name="dst" value="$(link-orig)" />
      <input type="text" name="username" placeholder="● ● ● ● ● ●" required />
      <input type="hidden" name="password" value="" />
      <button type="submit">Connect to WiFi</button>
    </form>
    <p class="footer">Powered by NileLink</p>
  </div>`);

  const css = `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: 'Segoe UI', system-ui, sans-serif;
  background: #0f0a1a;
  background-image: radial-gradient(ellipse at 50% 0%, #1e1b4b 0%, #0f0a1a 70%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.container {
  position: relative;
  background: rgba(30, 27, 75, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(167, 139, 250, 0.2);
  border-radius: 24px;
  padding: 48px 40px;
  width: 100%;
  max-width: 420px;
  text-align: center;
}
.glow {
  position: absolute;
  top: -2px; left: -2px; right: -2px; bottom: -2px;
  border-radius: 26px;
  background: linear-gradient(135deg, #a78bfa, #7c3aed, #a78bfa);
  opacity: 0.15;
  z-index: -1;
  filter: blur(8px);
}
.logo-img {
  width: 80px;
  height: 80px;
  object-fit: contain;
  margin-bottom: 16px;
  border-radius: 16px;
  border: 2px solid rgba(167, 139, 250, 0.3);
}
h1 { color: #e0e7ff; font-size: 26px; font-weight: 700; }
.subtitle { color: #a5b4fc; margin-top: 8px; font-size: 14px; }
form { margin-top: 28px; }
input[type="text"] {
  width: 100%;
  padding: 14px 18px;
  border: 2px solid rgba(167, 139, 250, 0.3);
  border-radius: 14px;
  font-size: 16px;
  text-align: center;
  letter-spacing: 4px;
  outline: none;
  background: rgba(15, 10, 26, 0.6);
  color: #e0e7ff;
  transition: border-color 0.3s;
}
input[type="text"]::placeholder { color: rgba(165, 180, 252, 0.4); }
input[type="text"]:focus { border-color: #a78bfa; }
button {
  width: 100%;
  margin-top: 16px;
  padding: 14px;
  background: linear-gradient(135deg, #7c3aed, #a78bfa);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
button:hover { transform: translateY(-1px); box-shadow: 0 8px 25px rgba(124, 58, 237, 0.4); }
.footer { margin-top: 28px; color: rgba(165, 180, 252, 0.5); font-size: 12px; }`;

  return { html, css };
}

// ─── Template 3: Sunrise ────────────────────────────────────
function sunriseTemplate(title: string, logoHtml: string) {
  const html = wrapHTML(`  <div class="container">
    ${logoHtml}
    <h1>${title}</h1>
    <p class="subtitle">Enter your voucher code to get online</p>
    <form method="post" action="$(link-login-only)">
      <input type="hidden" name="dst" value="$(link-orig)" />
      <input type="text" name="username" placeholder="Voucher Code" required />
      <input type="hidden" name="password" value="" />
      <button type="submit">☀ Get Connected</button>
    </form>
    <p class="footer">Powered by NileLink</p>
  </div>`);

  const css = `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: 'Segoe UI', system-ui, sans-serif;
  background: linear-gradient(160deg, #fbbf24, #f97316, #ea580c);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.container {
  background: #ffffff;
  border-radius: 24px;
  padding: 48px 40px;
  width: 100%;
  max-width: 420px;
  text-align: center;
  box-shadow: 0 25px 60px rgba(234, 88, 12, 0.2);
}
.logo-img {
  width: 80px;
  height: 80px;
  object-fit: contain;
  margin-bottom: 16px;
  border-radius: 50%;
  border: 3px solid #fbbf24;
}
h1 { color: #ea580c; font-size: 26px; font-weight: 700; }
.subtitle { color: #78716c; margin-top: 8px; font-size: 14px; }
form { margin-top: 28px; }
input[type="text"] {
  width: 100%;
  padding: 14px 18px;
  border: 2px solid #fed7aa;
  border-radius: 14px;
  font-size: 16px;
  text-align: center;
  letter-spacing: 2px;
  outline: none;
  background: #fffbeb;
  transition: border-color 0.3s;
}
input[type="text"]:focus { border-color: #f97316; background: #fff; }
button {
  width: 100%;
  margin-top: 16px;
  padding: 14px;
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
button:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(249,115,22,0.35); }
.footer { margin-top: 28px; color: #d6d3d1; font-size: 12px; }`;

  return { html, css };
}

// ─── Template 4: Ocean ──────────────────────────────────────
function oceanTemplate(title: string, logoHtml: string) {
  const html = wrapHTML(`  <div class="wave-bg"></div>
  <div class="container">
    ${logoHtml}
    <h1>${title}</h1>
    <p class="subtitle">Enter your voucher code to surf the web</p>
    <form method="post" action="$(link-login-only)">
      <input type="hidden" name="dst" value="$(link-orig)" />
      <input type="text" name="username" placeholder="Voucher Code" required />
      <input type="hidden" name="password" value="" />
      <button type="submit">🌊 Dive In</button>
    </form>
    <p class="footer">Powered by NileLink</p>
  </div>`);

  const css = `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: 'Segoe UI', system-ui, sans-serif;
  background: linear-gradient(180deg, #0c4a6e 0%, #1e3a5f 40%, #164e63 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
}
.wave-bg {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  height: 200px;
  background: linear-gradient(0deg, rgba(59,130,246,0.2) 0%, transparent 100%);
  border-radius: 50% 50% 0 0;
}
.container {
  position: relative;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 48px 40px;
  width: 100%;
  max-width: 420px;
  text-align: center;
  box-shadow: 0 25px 60px rgba(0,0,0,0.2);
}
.logo-img {
  width: 80px;
  height: 80px;
  object-fit: contain;
  margin-bottom: 16px;
  border-radius: 16px;
}
h1 { color: #1e3a5f; font-size: 26px; font-weight: 700; }
.subtitle { color: #64748b; margin-top: 8px; font-size: 14px; }
form { margin-top: 28px; }
input[type="text"] {
  width: 100%;
  padding: 14px 18px;
  border: 2px solid #bfdbfe;
  border-radius: 14px;
  font-size: 16px;
  text-align: center;
  letter-spacing: 2px;
  outline: none;
  background: #eff6ff;
  transition: border-color 0.3s;
}
input[type="text"]:focus { border-color: #3b82f6; background: #fff; }
button {
  width: 100%;
  margin-top: 16px;
  padding: 14px;
  background: linear-gradient(135deg, #2563eb, #1e3a5f);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
button:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(37,99,235,0.35); }
.footer { margin-top: 28px; color: #94a3b8; font-size: 12px; }`;

  return { html, css };
}

// ─── Template 5: Minimal ────────────────────────────────────
function minimalTemplate(title: string, logoHtml: string) {
  const html = wrapHTML(`  <div class="container">
    ${logoHtml}
    <h1>${title}</h1>
    <p class="subtitle">Enter your voucher code</p>
    <form method="post" action="$(link-login-only)">
      <input type="hidden" name="dst" value="$(link-orig)" />
      <input type="text" name="username" placeholder="Code" required />
      <input type="hidden" name="password" value="" />
      <button type="submit">Connect</button>
    </form>
    <p class="footer">Powered by NileLink</p>
  </div>`);

  const css = `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: 'Segoe UI', system-ui, sans-serif;
  background: #f8fafc;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.container {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 48px 40px;
  width: 100%;
  max-width: 380px;
  text-align: center;
}
.logo-img {
  width: 64px;
  height: 64px;
  object-fit: contain;
  margin-bottom: 16px;
}
h1 { color: #1e293b; font-size: 22px; font-weight: 600; }
.subtitle { color: #94a3b8; margin-top: 6px; font-size: 13px; }
form { margin-top: 24px; }
input[type="text"] {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 15px;
  text-align: center;
  letter-spacing: 2px;
  outline: none;
  transition: border-color 0.3s;
}
input[type="text"]:focus { border-color: #334155; }
button {
  width: 100%;
  margin-top: 14px;
  padding: 12px;
  background: #1e293b;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
button:hover { background: #334155; }
.footer { margin-top: 24px; color: #cbd5e1; font-size: 11px; }`;

  return { html, css };
}

// ─── Template 6: Forest ─────────────────────────────────────
function forestTemplate(title: string, logoHtml: string) {
  const html = wrapHTML(`  <div class="container">
    ${logoHtml}
    <h1>${title}</h1>
    <p class="subtitle">Enter your voucher code to connect</p>
    <form method="post" action="$(link-login-only)">
      <input type="hidden" name="dst" value="$(link-orig)" />
      <input type="text" name="username" placeholder="Voucher Code" required />
      <input type="hidden" name="password" value="" />
      <button type="submit">🌿 Connect</button>
    </form>
    <p class="footer">Powered by NileLink</p>
  </div>`);

  const css = `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: 'Segoe UI', system-ui, sans-serif;
  background: linear-gradient(160deg, #166534, #15803d, #065f46);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.container {
  background: #ffffff;
  border-radius: 24px;
  padding: 48px 40px;
  width: 100%;
  max-width: 420px;
  text-align: center;
  box-shadow: 0 25px 60px rgba(22, 101, 52, 0.2);
}
.logo-img {
  width: 80px;
  height: 80px;
  object-fit: contain;
  margin-bottom: 16px;
  border-radius: 16px;
}
h1 { color: #166534; font-size: 26px; font-weight: 700; }
.subtitle { color: #6b7280; margin-top: 8px; font-size: 14px; }
form { margin-top: 28px; }
input[type="text"] {
  width: 100%;
  padding: 14px 18px;
  border: 2px solid #bbf7d0;
  border-radius: 14px;
  font-size: 16px;
  text-align: center;
  letter-spacing: 2px;
  outline: none;
  background: #f0fdf4;
  transition: border-color 0.3s;
}
input[type="text"]:focus { border-color: #22c55e; background: #fff; }
button {
  width: 100%;
  margin-top: 16px;
  padding: 14px;
  background: linear-gradient(135deg, #22c55e, #166534);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
button:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(34,197,94,0.35); }
.footer { margin-top: 28px; color: #d1d5db; font-size: 12px; }`;

  return { html, css };
}
