"use client";

import AdminHeader from "./_components/AdminHeader";
import ProjectForm from "./_components/ProjectForm";
import ProjectList from "./_components/ProjectList";
import DrawingModal from "./_components/DrawingModal";
import useAdmin from "./_hooks/useAdmin";

export default function Admin() {
  const { error, logout, projectForm, projectList, drawingModal } = useAdmin();

  return (
    <main className="min-h-screen bg-[#f5f6fa] text-slate-900">
      <div className="mx-auto max-w-[1440px] px-5 py-6 sm:px-8 lg:px-12">
        <AdminHeader onLogout={logout} />
        {error && (
          <div
            role="alert"
            className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600"
          >
            {error}
          </div>
        )}
        <div className="mb-8 mt-9">
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-indigo-600">
            Your workspace
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Portfolio overview
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Create projects, manage drawings, and keep your best work up to
            date.
          </p>
        </div>
        <div className="grid min-w-0 gap-8">
          <ProjectList {...projectList} />
          <div id="project-editor" className="scroll-mt-6">
            <ProjectForm {...projectForm} />
          </div>
        </div>
      </div>
      {drawingModal.drawingProject && <DrawingModal {...drawingModal} />}
    </main>
  );
}

