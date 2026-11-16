// Build-time static rendering: injects the server-rendered app into dist/index.html
// so crawlers, link previews and no-JS visitors get the full page, and React hydrates it.
// Also preloads the above-the-fold fonts so the hero headline does not reflow on load.
import { readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const templatePath = `${root}dist/index.html`;
const ssrEntry = pathToFileURL(`${root}dist-ssr/entry-server.js`).href;

const PLACEHOLDER = '<!--app-html-->';
// Latin subsets used in the first viewport: Geist (headline) and Geist Mono (labels).
const PRELOAD_FONTS = [/^geist-latin-wght-normal-.+\.woff2$/, /^geist-mono-latin-wght-normal-.+\.woff2$/];

let html = await readFile(templatePath, 'utf8');
if (!html.includes(PLACEHOLDER)) {
  throw new Error(`Placeholder ${PLACEHOLDER} not found in dist/index.html`);
}

const assets = await readdir(`${root}dist/assets`);
const preloads = PRELOAD_FONTS.map((re) => {
  const file = assets.find((f) => re.test(f));
  if (!file) throw new Error(`Font to preload not found: ${re}`);
  return `<link rel="preload" href="/assets/${file}" as="font" type="font/woff2" crossorigin />`;
});
html = html.replace('</title>', `</title>\n    ${preloads.join('\n    ')}`);

const { render } = await import(ssrEntry);
html = html.replace(PLACEHOLDER, render());

await writeFile(templatePath, html);
await rm(`${root}dist-ssr`, { recursive: true, force: true });

console.log(`prerendered dist/index.html (${(html.length / 1024).toFixed(1)} kB, ${preloads.length} fonts preloaded)`);
