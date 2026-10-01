import { getDocument, GlobalWorkerOptions } from "./pdfjs/build/pdf.mjs";
GlobalWorkerOptions.workerSrc = "/pdfjs/build/pdf.worker.mjs";

const modal = document.getElementById("pdf-reader-modal");
const stage = modal.querySelector(".pdf-reader-stage");
const title = document.getElementById("pdf-reader-title");
const close = document.getElementById("pdf-reader-close");
const style = document.createElement("style");
style.textContent = `
.pdf-reader-modal {grid-template-rows:auto auto minmax(0,1fr) auto;background:#171a1c}
.pdf-toolbar {display:flex;align-items:center;gap:8px;padding:12px 24px;flex-wrap:wrap;border-bottom:1px solid #444}
.pdf-toolbar button,.pdf-toolbar select {background:#23282c;color:white;border:1px solid #454c52;border-radius:6px;padding:10px;font:inherit;font-size:12px}
.pdf-toolbar button:disabled {opacity:.4}
.pdf-toolbar select {flex:1;min-width:150px;max-width:520px}
.pdf-toolbar span {font-size:12px}
.pdf-reader-stage {overflow:auto;padding:24px;overscroll-behavior:contain}
.pdf-sheet {position:relative;margin:0 auto 24px;background:white;box-shadow:0 2px 12px #0006}
.pdf-sheet canvas {display:block;width:100%;height:100%}
.pdf-sheet .pdf-watermark-layer {grid-template-columns:repeat(2,1fr)}
.pdf-reader-footer {display:flex;justify-content:space-between;padding:12px 24px;font-size:12px;border-top:1px solid #444}
.pdf-reader-message {padding:24px;color:white}
@media(max-width:600px){.pdf-toolbar{padding:8px}.pdf-reader-stage{padding:12px}.pdf-toolbar select{max-width:none}.pdf-reader-head{padding:12px}}
`;
document.head.append(style);
const toolbar = document.createElement("div");
toolbar.className = "pdf-toolbar";
toolbar.innerHTML = `<button aria-label="Previous sheet" data-action="prev">←</button><select aria-label="Drawing sheet"></select><button aria-label="Next sheet" data-action="next">→</button><button aria-label="Zoom out" data-action="out">−</button><span data-zoom>100%</span><button aria-label="Zoom in" data-action="in">+</button><button data-action="sheet">Fit sheet</button><button data-action="width">Fit width</button><button data-action="full">Full screen</button>`;
stage.before(toolbar);
const footer = document.createElement("div");
footer.className = "pdf-reader-footer";
footer.setAttribute("aria-live", "polite");
stage.after(footer);
const select = toolbar.querySelector("select");
let task,
  observer,
  opener,
  version = 0,
  pages = [],
  current = 0,
  zoom = 1,
  mode = "width";
let oldInert = [];
const renders = new Set();

function status() {
  select.value = String(current);
  toolbar.querySelector('[data-action="prev"]').disabled = current <= 0;
  toolbar.querySelector('[data-action="next"]').disabled =
    current >= pages.length - 1;
  toolbar.querySelector("[data-zoom]").textContent =
    `${Math.round(zoom * 100)}%`;
  footer.replaceChildren();
  for (const text of [
    pages[current]?.label || "",
    pages.length ? `Sheet ${current + 1} / ${pages.length}` : "",
  ]) {
    const span = document.createElement("span");
    span.textContent = text;
    footer.append(span);
  }
}
function go(index) {
  current = Math.max(0, Math.min(pages.length - 1, index));
  pages[current]?.element.scrollIntoView({ block: "start" });
  status();
}
function render(entry) {
  if (entry.render || entry.rendered === zoom) return;
  const scale = zoom;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const viewport = entry.page.getViewport({ scale: scale * ratio });
  // Cap raster memory for very large architectural sheets.
  const limit = Math.min(
    1,
    Math.sqrt(16000000 / (viewport.width * viewport.height)),
  );
  const raster = entry.page.getViewport({ scale: scale * ratio * limit });
  entry.canvas.width = Math.ceil(raster.width);
  entry.canvas.height = Math.ceil(raster.height);
  const job = entry.page.render({
    canvasContext: entry.canvas.getContext("2d"),
    viewport: raster,
  });
  entry.render = job;
  renders.add(job);
  let cancelled = false;
  job.promise
    .then(() => {
      entry.rendered = scale;
    })
    .catch((error) => {
      cancelled = error.name === "RenderingCancelledException";
      if (!cancelled) {
        entry.rendered = scale;
        console.error("PDF page render failed", error);
      }
    })
    .finally(() => {
      entry.render = null;
      renders.delete(job);
      if (entry.element.isConnected && (cancelled || entry.rendered !== zoom))
        render(entry);
    });
}
function layout() {
  if (!pages.length) return;
  const page = pages[current].page.getViewport({ scale: 1 });
  if (mode)
    zoom =
      mode === "width"
        ? (stage.clientWidth - 48) / page.width
        : Math.min(
            (stage.clientWidth - 48) / page.width,
            (stage.clientHeight - 48) / page.height,
          );
  zoom = Math.max(0.1, Math.min(4, zoom));
  for (const entry of pages) {
    entry.render?.cancel();
    const viewport = entry.page.getViewport({ scale: zoom });
    entry.element.style.width = `${viewport.width}px`;
    entry.element.style.height = `${viewport.height}px`;
  }
  observer?.disconnect();
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) render(pages[Number(target.dataset.index)]);
      });
    },
    { root: stage, rootMargin: "300px" },
  );
  pages.forEach((entry) => observer.observe(entry.element));
  go(current);
}
export async function renderPdfPreview(url) {
  const loadingTask = getDocument({
    url,
    cMapUrl: "/pdfjs/cmaps/",
    cMapPacked: true,
    standardFontDataUrl: "/pdfjs/standard_fonts/",
    wasmUrl: "/pdfjs/wasm/",
  });
  try {
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);
    const initialViewport = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({
      scale: Math.min(1.5, 1200 / initialViewport.width),
    });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    await page.render({
      canvasContext: canvas.getContext("2d"),
      viewport,
    }).promise;
    return canvas.toDataURL("image/jpeg", 0.82);
  } finally {
    await loadingTask.destroy();
  }
}
export async function openPdf(project, button) {
  const token = ++version;
  observer?.disconnect();
  renders.forEach((job) => job.cancel());
  if (task) {
    const previous = task;
    task = null;
    await previous.destroy();
  }
  if (token !== version) return;
  opener = button;
  pages = [];
  current = 0;
  mode = "width";
  title.textContent = project.title;
  modal.hidden = false;
  document.body.classList.add("pdf-reader-open");
  if (!oldInert.length)
    oldInert = [...document.body.children]
      .filter(
        (node) => node !== modal && !["SCRIPT", "STYLE"].includes(node.tagName),
      )
      .map((node) => {
        const value = node.inert;
        node.inert = true;
        return [node, value];
      });
  close.focus();
  stage.innerHTML =
    '<p class="pdf-reader-message" role="status">Loading drawing sheets…</p>';
  select.replaceChildren();
  status();
  try {
    task = getDocument({
      url: project.pdf,
      cMapUrl: "/pdfjs/cmaps/",
      cMapPacked: true,
      standardFontDataUrl: "/pdfjs/standard_fonts/",
      wasmUrl: "/pdfjs/wasm/",
    });
    const pdf = await task.promise;
    const labels = await pdf.getPageLabels();
    const outline = await pdf.getOutline();
    const names = new Map();
    async function collect(items) {
      for (const item of items || []) {
        try {
          const dest =
            typeof item.dest === "string"
              ? await pdf.getDestination(item.dest)
              : item.dest;
          if (dest) {
            const index =
              typeof dest[0] === "number"
                ? dest[0]
                : await pdf.getPageIndex(dest[0]);
            if (!names.has(index)) names.set(index, item.title);
          }
        } catch {
          /* A malformed bookmark must not prevent opening a PDF. */
        }
        await collect(item.items);
      }
    }
    await collect(outline);
    const loaded = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      if (token !== version) return;
      const label = `${String(i).padStart(2, "0")} / ${names.get(i - 1) || (labels?.[i - 1] ? "Page " + labels[i - 1] : "Page " + i)}`;
      const element = document.createElement("div");
      element.className = "pdf-sheet";
      element.dataset.index = String(i - 1);
      const canvas = document.createElement("canvas");
      canvas.setAttribute("role", "img");
      canvas.setAttribute("aria-label", label);
      element.append(canvas);
      const watermark = document.createElement("div");
      watermark.className = "pdf-watermark-layer";
      watermark.setAttribute("aria-hidden", "true");
      for (let n = 0; n < 20; n++) {
        const text = document.createElement("span");
        text.textContent = "PROPERTY OF XPONEXUS • " + project.title;
        watermark.append(text);
      }
      element.append(watermark);
      loaded.push({
        page,
        label,
        element,
        canvas,
        render: null,
        rendered: null,
      });
    }
    if (token !== version) return;
    pages = loaded;
    stage.replaceChildren(...pages.map((entry) => entry.element));
    pages.forEach((entry, i) => {
      const option = document.createElement("option");
      option.value = String(i);
      option.textContent = entry.label;
      select.append(option);
    });
    layout();
  } catch (error) {
    if (token !== version) return;
    stage.replaceChildren();
    const message = document.createElement("p");
    message.className = "pdf-reader-message";
    message.setAttribute("role", "alert");
    message.textContent =
      "Unable to load this PDF. Please close the viewer and try again.";
    stage.append(message);
    console.error(error);
  }
}
export function closePdf() {
  ++version;
  observer?.disconnect();
  renders.forEach((job) => job.cancel());
  if (task) {
    task.destroy();
    task = null;
  }
  pages = [];
  stage.replaceChildren();
  modal.hidden = true;
  document.body.classList.remove("pdf-reader-open");
  oldInert.forEach(([node, value]) => {
    node.inert = value;
  });
  oldInert = [];
  if (document.fullscreenElement === modal)
    document.exitFullscreen().catch(() => {});
  opener?.focus();
}
close.addEventListener("click", closePdf);
select.addEventListener("change", () => go(Number(select.value)));
toolbar.addEventListener("click", async (event) => {
  const action = event.target.dataset.action;
  if (action === "full") {
    try {
      document.fullscreenElement
        ? await document.exitFullscreen()
        : await modal.requestFullscreen();
    } catch {}
    return;
  }
  if (!pages.length) return;
  if (action === "prev") go(current - 1);
  if (action === "next") go(current + 1);
  if (action === "in" || action === "out") {
    mode = null;
    zoom *= action === "in" ? 1.2 : 1 / 1.2;
    layout();
  }
  if (action === "sheet" || action === "width") {
    mode = action;
    layout();
  }
});
let scheduled = false;
stage.addEventListener("scroll", () => {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    if (!pages.length) return;
    const top = stage.getBoundingClientRect().top;
    let nearest = 0,
      distance = Infinity;
    pages.forEach((entry, i) => {
      const d = Math.abs(entry.element.getBoundingClientRect().top - top);
      if (d < distance) {
        distance = d;
        nearest = i;
      }
    });
    current = nearest;
    status();
  });
});
document.addEventListener("fullscreenchange", () => {
  toolbar.querySelector('[data-action="full"]').textContent =
    document.fullscreenElement ? "Exit full screen" : "Full screen";
  if (!modal.hidden) layout();
});
window.addEventListener("resize", () => {
  if (!modal.hidden) layout();
});
document.addEventListener("keydown", (event) => {
  if (modal.hidden) return;
  if (event.key === "Escape") {
    event.preventDefault();
    closePdf();
  }
  if (event.key === "Tab") {
    const elements = [
      ...modal.querySelectorAll("button:not(:disabled),select"),
    ];
    const first = elements[0],
      last = elements.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
  if (event.target.tagName === "SELECT") return;
  const action = {
    "+": "in",
    "=": "in",
    "-": "out",
    0: "sheet",
    ArrowLeft: "prev",
    ArrowRight: "next",
  }[event.key];
  if (action) {
    event.preventDefault();
    toolbar.querySelector(`[data-action="${action}"]`).click();
  }
});
