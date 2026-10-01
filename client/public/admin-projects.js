import { openPdf, renderPdfPreview } from "./pdf-reader.js";

(() => {
  "use strict";
  const grid = document.querySelector(".projects");
  const esc = (s) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  function makeCard(p, i) {
    const wrap = document.createElement("div");
    wrap.className = "card-wrap rise in-view is-settled";
    wrap.dataset.category = p.categoryKey || "external";
    wrap.dataset.sheets = String(p.sheetCount || 1);
    const preview = p.preview
      ? `<img src="${esc(p.preview)}" alt="${esc(p.title)} preview" loading="lazy">`
      : `<div class="preview-placeholder"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2h9l5 5v15H6zM15 2v6h5M9 13h6M9 17h6"/></svg><span>PDF project preview</span></div>`;
    wrap.innerHTML = `<article class="surface-card project-card"><div class="project-media" role="button" tabindex="0">${preview}<span class="preview-label">${esc(p.previewLabel || "Open PDF")}</span></div><div class="project-body"><div class="project-meta"><span class="project-category">${esc(p.category || "Project")}</span><span>Project ${String(i + 1).padStart(2, "0")}</span></div><h3>${esc(p.title)}</h3><p class="project-context">${esc(p.context || "Project drawing package.")}</p><dl class="project-scope"><dt>Scope</dt><dd>${esc(p.scope || "Project drawings and technical information.")}</dd></dl><div class="project-bottom"><span class="project-sheet-count">${esc((p.sheetCount || 1) + " PDF")}</span><button class="project-open" type="button">View PDF →</button></div></div></article>`;
    const btn = wrap.querySelector(".project-open"),
      media = wrap.querySelector(".project-media");
    // Only explicit design buttons open documents; the cover is a preview.
    media.removeAttribute("role");
    media.removeAttribute("tabindex");
    media.style.cursor = "default";
    media.querySelector(".preview-label").textContent = p.previewLabel || "Project preview";
    if (p.pdf) {
      btn.textContent = "View design";
      btn.addEventListener("click", () => openPdf(p, btn));
    } else {
      btn.remove();
    }
    if (!p.preview && p.pdf) {
      renderPdfPreview(p.pdf)
        .then((src) => {
          const placeholder = media.querySelector(".preview-placeholder");
          if (!placeholder || !media.isConnected) return;
          const image = document.createElement("img");
          image.src = src;
          image.alt = `${p.title} preview`;
          image.loading = "lazy";
          placeholder.replaceWith(image);
          media.classList.add("is-loaded");
        })
        .catch((error) => console.error("Unable to render PDF preview:", error));
    }
    return wrap;
  }
  fetch("/xpo-api/projects", { cache: "no-store" })
    .then((r) => {
      if (!r.ok) throw new Error("No external project registry");
      return r.json();
    })
    .then((data) => {
      const projects = Array.isArray(data) ? data : data.projects;
      if (!Array.isArray(projects) || !grid) return;
      projects
        .filter((p) => p && p.title)
        .forEach((p, i) => {
          // Imported original packages already have cards and a native drawing viewer.
          const originalKey = p.slug?.replace(/^portfolio-/, "");
          if (p.slug?.startsWith("portfolio-") &&
              [...grid.querySelectorAll("[data-project]")].some((card) => card.dataset.project === originalKey)) return;
          const drawings = (p.drawings || []).filter((d) => d.pdf_url);
          // Older entries may have a PDF saved in the project thumbnail field.
          const thumbnailPdf = /\.pdf(?:[?#]|$)/i.test(p.thumbnail || "")
            ? p.thumbnail
            : "";
          const projectPdf = p.pdf || thumbnailPdf;
          const pdf = projectPdf || drawings[0]?.pdf_url;
          if (!pdf && !drawings.length && !p.thumbnail && !p.preview) return;
          const card = makeCard(
            {
              ...p,
              pdf,
              previewLabel: p.preview_label || p.previewLabel,
              preview:
                p.preview ||
                (thumbnailPdf ? "" : p.thumbnail) ||
                drawings[0]?.thumbnail_url,
              categoryKey: p.categoryKey || p.category,
              sheetCount: new Set([projectPdf, ...drawings.map((d) => d.pdf_url)].filter(Boolean)).size,
              context: p.context || p.description,
            },
            i,
          );
          const additionalDrawings = drawings.filter((d) => d.pdf_url !== pdf);
          if (additionalDrawings.length > 0) {
            const links = document.createElement("div");
            links.className = "project-bottom";
            additionalDrawings.forEach((d) => {
              const button = document.createElement("button");
              button.type = "button";
              button.className = "project-open";
              button.textContent = d.title ? `View design: ${d.title}` : "View design";
              button.addEventListener("click", () =>
                openPdf(
                  { ...p, title: p.title + " - " + d.title, pdf: d.pdf_url },
                  button,
                ),
              );
              links.append(button);
            });
            card.querySelector(".project-body").append(links);
          }
          grid.append(card);
        });
      document.querySelector('[data-filter][aria-pressed="true"]')?.click();
    })
    .catch((error) => {
      console.error("Unable to load published projects:", error);
      const notice = document.createElement("p");
      notice.setAttribute("role", "status");
      notice.textContent =
        "Additional projects could not be loaded. Please refresh to try again.";
      grid?.after(notice);
    });
})();
