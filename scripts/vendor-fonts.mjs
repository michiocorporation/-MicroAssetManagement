// Keep the official, unicode-subsetted web fonts local to this static site.
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'public', 'fonts');
await mkdir(output, { recursive: true });
const stylesheet = await fetch('https://fonts.googleapis.com/css2?family=Inter:wght@400..700&family=Noto+Sans+JP:wght@400..700&display=swap', {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' },
  signal: AbortSignal.timeout(30000),
});
if (!stylesheet.ok) throw new Error(`Font stylesheet: ${stylesheet.status}`);
let css = await stylesheet.text();
const urls = [...new Set(css.match(/https:\/\/fonts\.gstatic\.com\/[^)]+/g))];
const jobs = urls.map((url, index) => ({ url, name: `font-${String(index + 1).padStart(3, '0')}.woff2` }));
async function download(url, destination) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`${response.status}: ${url}`);
  await writeFile(destination, Buffer.from(await response.arrayBuffer()));
}
let next = 0;
await Promise.all(Array.from({ length: 6 }, async () => {
  while (next < jobs.length) {
    const job = jobs[next++];
    await download(job.url, path.join(output, job.name));
  }
}));
for (const job of jobs) css = css.replaceAll(job.url, `./${job.name}`);
await writeFile(path.join(output, 'fonts.css'), css);
for (const [family, folder] of [['Noto-Sans-JP', 'notosansjp'], ['Inter', 'inter']]) {
  await download(`https://raw.githubusercontent.com/google/fonts/main/ofl/${folder}/OFL.txt`, path.join(output, `${family}-OFL.txt`));
}
await writeFile(path.join(output, 'SOURCE.txt'), 'Noto Sans JP and Inter, weights 400–700.\nOfficial Google Fonts CSS API; original WOFF2 unicode subsets, unmodified.\nBoth fonts use the SIL Open Font License, included alongside these files.\n' + jobs.map(job => `${job.name} ${job.url}`).join('\n') + '\n');
console.log(`Stored ${jobs.length} WOFF2 subsets and both licenses in public/fonts.`);
