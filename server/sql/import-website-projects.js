import "../config/env.js";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { pool } from "../config/db.js";

// Import the original portfolio without changing existing projects or admin credentials.
const publicRoot = new URL("../../client/public/", import.meta.url);
const clean = (text) => text.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
let client;
try {
  const html = await readFile(new URL("xponexus.html", publicRoot), "utf8");
  const index = JSON.parse(html.match(/<script[^>]*id="drawing-index"[^>]*>([\s\S]*?)<\/script>/)[1]);
  const cards = [...html.matchAll(/<article class="surface-card project-card" data-project="([^"]+)">([\s\S]*?)<\/article>/g)];
  if (cards.length !== 4) throw new Error("Expected the four original portfolio cards");
  await mkdir(new URL("portfolio-previews/", publicRoot), { recursive: true });
  client = await pool.connect();
  await client.query("BEGIN");
  // Serialize repeat imports; existing rows are never overwritten.
  await client.query("SELECT pg_advisory_xact_lock(7392146)");
  const before = await client.query("SELECT id FROM projects ORDER BY id");
  let added = 0, drawings = 0;
  for (const [order, [, key, card]] of cards.entries()) {
    const project = index[key];
    if (!project?.pages?.length) throw new Error(`Missing drawing package: ${key}`);
    const slug = `portfolio-${key}`;
    const existing = await client.query("SELECT id FROM projects WHERE slug=$1 OR lower(title)=lower($2)", [slug, project.name]);
    if (existing.rowCount) continue;
    const image = card.match(/src="data:image\/jpeg;base64,([^"]+)"/);
    if (!image) throw new Error(`Missing preview: ${key}`);
    await writeFile(new URL(`portfolio-previews/${key}.jpg`, publicRoot), Buffer.from(image[1], "base64"));
    const categories = { audrey: "new-build", hereford: "conversion", connor: "extension", evenston: "alteration" };
    const { rows: [row] } = await client.query(`INSERT INTO projects
      (title,slug,category,description,scope,preview_label,thumbnail,published,sort_order)
      VALUES($1,$2,$3,$4,$5,$6,$7,true,$8) RETURNING id`, [
      project.name, slug, categories[key],
      clean(card.match(/class="project-context">([\s\S]*?)<\/p>/)[1]),
      clean(card.match(/<dd>([\s\S]*?)<\/dd>/)[1]),
      clean(card.match(/class="preview-label">([\s\S]*?)<\/span>/)[1]),
      `/portfolio-previews/${key}.jpg`, order,
    ]);
    for (const [pageIndex, page] of project.pages.entries()) {
      await client.query(`INSERT INTO drawings
        (project_id,title,reference,pdf_url,published,sort_order)
        VALUES($1,$2,$3,$4,true,$5)`, [row.id, page.title, page.reference,
        `/xponexus.html?drawing=${key}&sheet=${pageIndex + 1}`, pageIndex]);
      drawings++;
    }
    added++;
  }
  await client.query("COMMIT");
  console.log(`Imported ${added} projects and ${drawings} drawings. Preserved ${before.rowCount} existing projects.`);
} catch (error) {
  if (client) await client.query("ROLLBACK");
  console.error("Portfolio import failed:", error.message);
  process.exitCode = 1;
} finally {
  client?.release();
  await pool.end();
}
