// Збирає статичні сторінки політики, умов, видалення акаунта й підтримки в docs/
// для GitHub Pages. Запуск: node legal/build.mjs
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const OUT = join(here, '..', 'docs');

export const CONFIG = {
  owner: '[OWNER NAME]',
  email: 'hello.dotyk@gmail.com',
  updated: '2026-10-19',
  base: 'https://mylayed.github.io/couple',
};

export const LANGS = ['en', 'uk', 'es', 'de', 'fr', 'it', 'pt', 'pl'];
const PAGES = [
  ['privacy', 'privacy.html'],
  ['terms', 'terms.html'],
  ['delete', 'delete-account.html'],
  ['support', 'support.html'],
];

const fill = (s) =>
  s
    .replaceAll('{owner}', CONFIG.owner)
    .replaceAll('{email}', CONFIG.email)
    .replaceAll('{updated}', CONFIG.updated)
    .replaceAll('{base}', CONFIG.base);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

const LOGO = `<svg viewBox="0 0 100 100" width="28" height="28" aria-hidden="true"><path d="M47.8 86C19 63 4 46 4 30 4 16 14 7 27 7c10 0 18 6 20.8 15z" fill="#FF7A8C"/><path d="M52.2 86C81 63 96 46 96 30 96 16 86 7 73 7c-10 0-18 6-20.8 15z" fill="#9B85FF"/></svg>`;

const CSS = `
:root{--bg:#FFF7F5;--surface:#FFFFFF;--text:#2A1F2D;--muted:#6E6273;--border:#EADDE0;--primary:#E8475E;}
@media (prefers-color-scheme:dark){:root{--bg:#14111A;--surface:#1E1A26;--text:#F4EEF6;--muted:#A79CAD;--border:#2E2838;--primary:#FF7A8C;}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);font:16px/1.65 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
a{color:var(--primary)}
header,main,footer{max-width:760px;margin:0 auto;padding:0 16px}
header{display:flex;flex-wrap:wrap;align-items:center;gap:12px 20px;padding-top:24px;padding-bottom:8px}
.brand{display:flex;align-items:center;gap:8px;font-weight:700;font-size:20px;color:var(--text);text-decoration:none;margin-right:auto}
nav{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:15px}
nav a{text-decoration:none;color:var(--muted)}nav a[aria-current]{color:var(--primary);font-weight:600}
main{background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:24px 20px 28px;margin:12px 16px 0}
@media (min-width:792px){main{margin:12px auto 0}}
h1{font-size:28px;line-height:1.25;margin:0 0 6px}h2{font-size:19px;margin:28px 0 8px}
.updated{color:var(--muted);font-size:14px;margin:0 0 16px}
ul,ol{padding-left:22px}li{margin:4px 0}
footer{color:var(--muted);font-size:14px;padding-top:20px;padding-bottom:40px}
.langs{display:flex;flex-wrap:wrap;gap:6px 12px}.langs a{text-decoration:none}.langs a[aria-current]{font-weight:700}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-top:16px}
.cards a{display:block;padding:14px 16px;border:1px solid var(--border);border-radius:14px;text-decoration:none;font-weight:600}
@media (min-width:600px){main{padding:32px 36px 36px}}
`;

function section(s) {
  let h = s.h ? `<h2>${fill(s.h)}</h2>` : '';
  for (const p of s.p ?? []) h += `<p>${fill(p)}</p>`;
  if (s.ul) h += `<ul>${s.ul.map((i) => `<li>${fill(i)}</li>`).join('')}</ul>`;
  if (s.ol) h += `<ol>${s.ol.map((i) => `<li>${fill(i)}</li>`).join('')}</ol>`;
  for (const p of s.p2 ?? []) h += `<p>${fill(p)}</p>`;
  return h;
}

function layout({ lang, t, title, body, current, file, langLinks }) {
  const nav = PAGES.map(
    ([k, f]) => `<a href="${f}"${k === current ? ' aria-current="page"' : ''}>${t.ui.nav[k]}</a>`,
  ).join('');
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} · Dotyk</title>
<link rel="canonical" href="${CONFIG.base}/${lang}/${file}">
${LANGS.map((l) => `<link rel="alternate" hreflang="${l}" href="${CONFIG.base}/${l}/${file}">`).join('\n')}
<style>${CSS}</style>
</head>
<body>
<header><a class="brand" href="./">${LOGO}Dotyk</a><nav>${nav}</nav></header>
<main>${body}</main>
<footer><div class="langs">${langLinks}</div></footer>
</body>
</html>
`;
}

async function load(lang) {
  const p = join(here, 'content', `${lang}.mjs`);
  if (!existsSync(p)) return null;
  return (await import(pathToFileURL(p).href)).default;
}

const write = (path, html) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, html);
};

const all = {};
for (const lang of LANGS) {
  const t = await load(lang);
  if (t) all[lang] = t;
}
const available = Object.keys(all);

for (const lang of available) {
  const t = all[lang];
  for (const [key, file] of [...PAGES, ['index', 'index.html']]) {
    const langLinks = available
      .map(
        (l) =>
          `<a href="../${l}/${file}"${l === lang ? ' aria-current="true"' : ''}>${all[l].langName}</a>`,
      )
      .join('');
    let title, body;
    if (key === 'index') {
      title = t.ui.indexTitle;
      body = `<h1>${fill(t.ui.indexTitle)}</h1><p>${fill(t.ui.indexIntro)}</p><div class="cards">${PAGES.map(
        ([k, f]) => `<a href="${f}">${t.ui.nav[k]}</a>`,
      ).join('')}</div>`;
    } else {
      const doc = t[key];
      title = doc.title;
      body = `<h1>${fill(doc.title)}</h1>${
        key === 'support' ? '' : `<p class="updated">${fill(t.ui.updated)}</p>`
      }<p>${fill(doc.intro)}</p>${doc.sections.map(section).join('')}`;
    }
    write(join(OUT, lang, file), layout({ lang, t, title, body, current: key, file, langLinks }));
  }
}

// Корінь: перенаправляє на мову браузера, без JS — список мов
const rootLinks = available.map((l) => `<li><a href="${l}/">${all[l].langName}</a></li>`).join('');
write(
  join(OUT, 'index.html'),
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Dotyk</title><style>${CSS}</style>
<script>var a=${JSON.stringify(available)},l=(navigator.language||'en').slice(0,2).toLowerCase();location.replace((a.indexOf(l)>-1?l:'en')+'/');</script>
</head><body><header><span class="brand">${LOGO}Dotyk</span></header><main><ul>${rootLinks}</ul></main></body></html>
`,
);
write(join(OUT, '.nojekyll'), '');
console.log(`Built ${available.length} languages: ${available.join(', ')}`);
