"use client";

import { useState } from "react";
import { ImagePlus, Plus, Save, UploadCloud } from "lucide-react";
import { categories, field } from "../constants";

function Field({ label, id, children }) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-slate-700"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export default function ProjectForm({
  form,
  setForm,
  editing,
  busy,
  saveProject,
  cancelProject,
  upload,
  setError,
  success,
  uploadProjectPdf,
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const pdfFilename = (() => {
    if (!form.pdf) return "No PDF uploaded yet";
    const filename = form.pdf.split(/[?#]/)[0].split("/").pop();
    try { return decodeURIComponent(filename).replace(/^\d{13}-/, ""); }
    catch { return filename || "Uploaded PDF"; }
  })();
  const update = (key, value) =>
    setForm((previous) => ({ ...previous, [key]: value }));
  return (
    <form
      onSubmit={saveProject}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-5">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
            <Plus size={20} />
          </span>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              {editing ? "Edit project" : "New project"}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Make your next project stand out.
            </p>
          </div>
        </div>
        {editing && (
          <button
            type="button"
            onClick={cancelProject}
            className="text-sm font-medium text-slate-500 hover:text-indigo-600"
          >
            Cancel
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 gap-6 p-5 sm:p-6 lg:grid-cols-3">
        <section className="min-w-0 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            01 / Project details
          </h3>
          <Field label="Project title" id="project-title">
            <input
              id="project-title"
              required
              className={field}
              placeholder="e.g. The courtyard residence"
              value={form.title}
              onChange={(e) =>
                setForm((previous) => ({
                  ...previous,
                  title: e.target.value,
                  slug: editing
                    ? previous.slug
                    : e.target.value
                        .toLowerCase()
                        .trim()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/(^-|-$)/g, ""),
                }))
              }
            />
          </Field>
          <Field label="Project slug" id="project-slug">
            <input
              id="project-slug"
              required
              className={field}
              placeholder="the-courtyard-residence"
              value={form.slug}
              onChange={(e) => update("slug", e.target.value)}
            />
          </Field>
          <Field label="Preview title" id="project-preview-title">
            <input
              id="project-preview-title"
              className={field}
              placeholder="e.g. Construction Details"
              value={form.preview_label}
              onChange={(e) => update("preview_label", e.target.value)}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category" id="project-category">
              <select
                id="project-category"
                className={`${field} capitalize`}
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c.replaceAll("-", " ")}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Display order" id="project-order">
              <input
                id="project-order"
                className={field}
                type="number"
                value={form.sort_order}
                onChange={(e) => update("sort_order", Number(e.target.value))}
              />
            </Field>
          </div>
        </section>
        <section className="min-w-0 space-y-4 border-t border-slate-100 pt-6 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            02 / About the project
          </h3>
          <Field label="Description" id="project-description">
            <textarea
              id="project-description"
              className={`${field} resize-y`}
              rows={3}
              placeholder="Tell the story behind this project..."
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </Field>
          <Field label="Scope of work" id="project-scope">
            <textarea
              id="project-scope"
              className={`${field} resize-y`}
              rows={2}
              placeholder="Design, planning, construction..."
              value={form.scope}
              onChange={(e) => update("scope", e.target.value)}
            />
          </Field>
        </section>
        <section className="min-w-0 space-y-4 border-t border-slate-100 pt-6 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            03 / Cover & visibility
          </h3>
          <label
            className={`relative flex cursor-pointer flex-col items-center gap-2 overflow-hidden rounded-xl border border-dashed border-indigo-200 bg-indigo-50/40 p-5 text-center transition hover:bg-indigo-50 focus-within:ring-2 focus-within:ring-indigo-500 ${uploading ? "opacity-60" : ""}`}
          >
            {form.thumbnail ? (
              <img
                src={form.thumbnail}
                alt="Project cover preview"
                className="mb-2 h-20 w-full rounded-lg object-cover"
              />
            ) : (
              <span className="mb-1 rounded-xl bg-white p-3 text-indigo-500 shadow-sm">
                <ImagePlus size={24} />
              </span>
            )}
            <span className="flex items-center gap-2 text-sm font-semibold text-indigo-600">
              <UploadCloud size={16} />
              {uploading
                ? "Uploading cover..."
                : form.thumbnail
                  ? "Replace cover image"
                  : "Upload cover image"}
            </span>
            <span className="text-xs text-slate-500">
              Choose an image from your device
            </span>
            <input
              type="file"
              aria-label="Upload project cover image"
              accept="image/*"
              disabled={uploading || uploadingPdf || busy}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (!file.type.startsWith("image/")) { setError("Choose an image for the cover."); return; }
                setUploading(true);
                try {
                  const url = await upload(file);
                  update("thumbnail", url);
                } catch (error) {
                  setError(error.message);
                } finally {
                  setUploading(false);
                  e.target.value = "";
                }
              }}
            />
          </label>
          <Field label="Drawing / project PDF" id="project-pdf">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="break-all text-sm text-slate-700" role="status">{pdfFilename}</p>
              <label htmlFor="project-pdf" className={`relative mt-3 inline-flex rounded-lg bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 focus-within:ring-2 focus-within:ring-indigo-500 ${uploading || uploadingPdf || busy ? "cursor-wait opacity-60" : "cursor-pointer hover:bg-indigo-100"}`}>
                {uploadingPdf ? "Uploading PDF..." : form.pdf ? "Replace PDF" : "Upload PDF"}
            <input
              id="project-pdf"
              type="file"
              accept="application/pdf,.pdf"
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              aria-label={form.pdf ? "Replace PDF" : "Upload PDF"}
              disabled={uploading || uploadingPdf || busy}
              onChange={async (e) => {
                const input = e.currentTarget;
                const file = input.files?.[0];
                if (!file) return;
                if (file.type !== "application/pdf") { setError("Choose a PDF document."); input.value = ""; return; }
                setUploadingPdf(true);
                setError("");
                try {
                  await uploadProjectPdf(file);
                } catch (error) {
                  setError(error.message);
                } finally {
                  setUploadingPdf(false);
                  input.value = "";
                }
              }}
            />
              </label>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {uploadingPdf ? "Uploading PDF..." : editing ? "PDF uploads are saved immediately. Opens from View design." : "Upload a PDF, then click Create project to save it."}
            </p>
            {form.pdf && <a href={form.pdf} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-indigo-600">View uploaded PDF</a>}
          </Field>
          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl bg-slate-50 p-4">
            <span>
              <span className="block text-sm font-medium text-slate-800">
                Publish project
              </span>
              <span className="mt-1 block text-xs text-slate-500">
                Visible on your public portfolio
              </span>
            </span>
            <input
              type="checkbox"
              className="peer sr-only"
              checked={form.published}
              onChange={(e) => update("published", e.target.checked)}
            />
            <span className="relative h-6 w-11 shrink-0 rounded-full bg-slate-300 transition after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition peer-checked:bg-indigo-600 peer-checked:after:translate-x-5 peer-focus-visible:ring-4 peer-focus-visible:ring-indigo-200" />
          </label>
        </section>
      </div>
      <div className="flex justify-end border-t border-slate-100 bg-slate-50/60 px-6 py-4">
        <button
          type="submit"
          disabled={busy || uploading || uploadingPdf}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 sm:w-auto px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {editing ? <Save size={17} /> : <Plus size={17} />}
          {busy ? "Saving..." : editing ? "Save changes" : "Create project"}
        </button>
      </div>
      <div role="status" aria-live="polite" aria-atomic="true">
        {success && (
          <p className="border-t border-emerald-100 bg-emerald-50 px-6 py-4 text-sm font-medium text-emerald-700">
            {success}
          </p>
        )}
      </div>
    </form>
  );
}

