import { cp, mkdir } from 'node:fs/promises';
const source = new URL('../node_modules/pdfjs-dist/', import.meta.url);
const target = new URL('../public/pdfjs/', import.meta.url);
await mkdir(target, { recursive: true });
for (const entry of ['build/pdf.mjs', 'build/pdf.worker.mjs', 'cmaps', 'standard_fonts', 'wasm']) {
  await cp(new URL(entry, source), new URL(entry, target), { recursive: true });
}
