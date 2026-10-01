"use client";

import { useState } from "react";
import {
  Search,
  FolderOpen,
  ImageIcon,
  Pencil,
  Plus,
  Trash2,
  FileText,
} from "lucide-react";

function Cover({ src, title }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="relative grid h-28 w-full shrink-0 place-items-center overflow-hidden rounded-xl bg-slate-100 text-slate-400 sm:h-24 sm:w-28">
      <ImageIcon size={28} strokeWidth={1.3} />
      {src && !failed && (
        <img
          src={src}
          alt={title}
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </div>
  );
}

export default function ProjectList({
  projects,
  editProject,
  openDrawing,
  deleteProject,
  deleteDrawing,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All projects");
  const visible = projects.filter(
    (p) =>
      `${p.title} ${p.category}`.toLowerCase().includes(query.toLowerCase()) &&
      (filter === "All projects" ||
        (filter === "Published" ? p.published : !p.published)),
  );
  const pageCount = Math.max(1, Math.ceil(visible.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * pageSize;
  const paginated = visible.slice(start, start + pageSize);
  const published = projects.filter((p) => p.published).length;
  const action =
    "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600";
  return (
    <section className="min-w-0" aria-label="Projects">
      <div className="mb-6 grid grid-cols-3 gap-3">
        {[
          ["Total projects", projects.length],
          ["Published", published],
          [
            "Drawings",
            projects.reduce((count, p) => count + (p.drawings?.length || 0), 0),
          ],
        ].map(([label, count]) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"
          >
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              {count.toString().padStart(2, "0")}
            </p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold tracking-tight">
              Project library
            </h2>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
              {projects.length} {projects.length === 1 ? "project" : "projects"}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Browse, edit, and manage your projects and drawings.
          </p>
          <button
            type="button"
            aria-expanded={isOpen}
            aria-controls="admin-project-library"
            onClick={() => setIsOpen((open) => !open)}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <FolderOpen size={17} />
            {isOpen ? "Close projects" : "View projects"}
          </button>
        </div>
        <div id="admin-project-library" hidden={!isOpen}>
        <div className="border-b border-slate-100 p-5 sm:p-6">
          <div className="relative mt-5">
            <Search
              size={17}
              className="pointer-events-none absolute left-3.5 top-3.5 text-slate-400"
            />
            <input
              aria-label="Search projects"
              type="search"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder="Search projects..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {["All projects", "Published", "Hidden"].map((label) => (
              <button
                key={label}
                onClick={() => { setFilter(label); setPage(1); }}
                aria-pressed={filter === label}
                className={`rounded-lg px-3 py-2 text-xs font-medium transition ${filter === label ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-slate-50"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <label className="mt-4 flex items-center gap-3 text-sm text-slate-500">
            Projects per page
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700 focus:border-indigo-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
            </select>
          </label>
        </div>
        <div className="space-y-4 p-4 sm:p-6">
          {!visible.length && (
            <div className="flex flex-col items-center px-4 py-16 text-center">
              <span className="mb-4 rounded-2xl bg-slate-50 p-4 text-slate-400">
                <FolderOpen size={30} />
              </span>
              <h3 className="font-semibold">
                {projects.length
                  ? "No matching projects"
                  : "Your portfolio starts here"}
              </h3>
              <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
                {projects.length
                  ? "Try another search or choose a different filter."
                  : "Create your first project using the form, then add your drawings."}
              </p>
            </div>
          )}
          {paginated.map((p) => (
            <article
              key={p.id}
              className="overflow-hidden rounded-xl border border-slate-200 transition hover:border-indigo-200"
            >
              <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <Cover
                  key={p.thumbnail || "empty"}
                  src={p.thumbnail}
                  title={p.title}
                />
                <div className="min-w-0 flex-1">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-medium ${p.published ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${p.published ? "bg-emerald-500" : "bg-slate-400"}`}
                    />
                    {p.published ? "Published" : "Hidden"}
                  </span>
                  <h3 className="mt-2 break-words text-base font-semibold tracking-tight">
                    {p.title}
                  </h3>
                  <p className="mt-1 text-xs capitalize text-slate-500">
                    {p.category?.replaceAll("-", " ")}
                    <span className="mx-2 text-slate-300">/</span>
                    {p.drawings?.length || 0} drawings
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 bg-slate-50/60 px-4 py-3">
                <button onClick={() => editProject(p)} className={action}>
                  <Pencil size={14} />
                  Edit project
                </button>
                <button onClick={() => openDrawing(p.id)} className={action}>
                  <Plus size={14} />
                  Add drawing
                </button>
                <button
                  onClick={() => deleteProject(p)}
                  aria-label={`Delete ${p.title}`}
                  title="Delete project"
                  className="ml-auto rounded-lg p-2.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              {!!p.drawings?.length && (
                <details className="divide-y divide-slate-100 border-t border-slate-100 px-4">
                  <summary className="cursor-pointer py-3 text-sm font-medium text-indigo-600">
                    View drawings ({p.drawings.length})
                  </summary>
                  {p.drawings.map((d) => (
                    <div
                      key={d.id}
                      className="flex flex-wrap items-center justify-between gap-3 py-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <FileText
                          size={18}
                          className="shrink-0 text-indigo-400"
                        />
                        <div className="min-w-0">
                          <p className="break-words text-sm font-medium">
                            {d.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {d.reference || "No reference"} /{" "}
                            {d.published ? "Published" : "Hidden"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <button
                          onClick={() => openDrawing(p.id, d)}
                          className="py-2 text-indigo-600"
                        >
                          Edit
                        </button>
                        {d.pdf_url && (
                          <a
                            href={d.pdf_url}
                            target="_blank"
                            rel="noreferrer"
                            className="py-2 text-slate-500"
                          >
                            View PDF
                          </a>
                        )}
                        <button
                          onClick={() => deleteDrawing(d.id)}
                          className="py-2 text-red-500"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </details>
              )}
            </article>
          ))}
        </div>
        <nav aria-label="Project pagination" className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 p-5 sm:px-6">
          <p role="status" className="text-sm text-slate-500">
            {visible.length ? `${start + 1}–${Math.min(start + pageSize, visible.length)} of ${visible.length} projects` : "0 projects"}
          </p>
          <div className="flex items-center gap-3">
            <button type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} className={`${action} disabled:cursor-not-allowed disabled:opacity-40`}>
              Previous
            </button>
            <span className="text-xs text-slate-500">Page {currentPage} of {pageCount}</span>
            <button type="button" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)} className={`${action} disabled:cursor-not-allowed disabled:opacity-40`}>
              Next
            </button>
          </div>
        </nav>
        </div>
      </div>
    </section>
  );
}
