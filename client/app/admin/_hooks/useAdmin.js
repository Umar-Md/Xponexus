"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../lib/api";
import { blankProject, blankDrawing } from "../constants";

export default function useAdmin() {
  const router = useRouter();

  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(blankProject);
  const [editing, setEditing] = useState(null);
  const [drawingProject, setDrawingProject] = useState(null);
  const [drawing, setDrawing] = useState(blankDrawing);
  const [error, setError] = useState("");
  const [projectSuccess, setProjectSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      await api.me();
      setProjects(await api.adminProjects());
    } catch {
      router.replace("/admin/login");
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function upload(file) {
    if (!file) return "";
    const fd = new FormData();
    fd.append("file", file);
    return (await api.upload(fd)).url;
  }

  async function saveProject(e) {
    e.preventDefault();
    setProjectSuccess("");
    setBusy(true);
    setError("");

    try {
      const savedProject = editing
        ? await api.updateProject(editing, form)
        : await api.createProject(form);

      if (form.pdf && savedProject.pdf !== form.pdf) {
        // Keep the uploaded URL and switch to editing to avoid duplicate projects on retry.
        setEditing(savedProject.id);
        throw new Error("The project was saved, but its PDF link was not saved. Restart the backend, then click Save changes to attach the uploaded PDF.");
      }

      setProjectSuccess(editing ? "Project updated successfully." : "Project added successfully.");
      setEditing(null);
      setForm(blankProject);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function uploadProjectPdf(file) {
    setProjectSuccess("");
    const url = await upload(file);
    setForm((previous) => ({ ...previous, pdf: url }));
    if (editing) {
      const saved = await api.updateProjectPdf(editing, url);
      setProjects((previous) => previous.map((p) => p.id === saved.id ? { ...p, pdf: saved.pdf } : p));
      setProjectSuccess("PDF uploaded and saved successfully.");
    } else {
      setProjectSuccess("PDF uploaded. Click Create project to publish it with your new project.");
    }
  }

  function editProject(p) {
    setProjectSuccess("");
    setEditing(p.id);

    setForm({
      title: p.title || "",
      slug: p.slug || "",
      category: p.category || "new-build",
      description: p.description || "",
      scope: p.scope || "",
      preview_label: p.preview_label || "",
      thumbnail: /\.pdf(?:[?#]|$)/i.test(p.thumbnail || "") ? "" : p.thumbnail || "",
      pdf: p.pdf || (/\.pdf(?:[?#]|$)/i.test(p.thumbnail || "") ? p.thumbnail : ""),
      published: !!p.published,
      sort_order: p.sort_order || 0,
    });

    document.getElementById("project-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function saveDrawing(e) {
    e.preventDefault();
    if (!drawingProject) return;

    setBusy(true);
    setError("");

    try {
      drawing.id
        ? await api.updateDrawing(drawing.id, drawing)
        : await api.createDrawing(drawingProject, drawing);

      setDrawing(blankDrawing);
      setDrawingProject(null);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  function cancelProject() {
    setProjectSuccess("");
    setEditing(null);
    setForm(blankProject);
  }

  function openDrawing(projectId, value = blankDrawing) {
    setDrawingProject(projectId);
    setDrawing({ ...value });
  }

  function closeDrawing() {
    setDrawingProject(null);
  }

  async function deleteProject(project) {
    if (!confirm(`Delete ${project.title}?`)) return;
    try {
      setError("");
      await api.deleteProject(project.id);
      await load();
    } catch (error) {
      setError(error.message);
    }
  }

  async function deleteDrawing(id) {
    if (!confirm("Delete drawing?")) return;
    try {
      setError("");
      await api.deleteDrawing(id);
      await load();
    } catch (error) {
      setError(error.message);
    }
  }

  async function logout() {
    try {
      await api.logout();
      router.replace("/admin/login");
    } catch (error) {
      setError(error.message);
    }
  }

  return {
    projects,
    error,
    logout,
    projectForm: {
      uploadProjectPdf,
      success: projectSuccess,
      form,
      setForm,
      editing,
      busy,
      saveProject,
      cancelProject,
      upload,
      setError,
    },
    projectList: {
      projects,
      editProject,
      openDrawing,
      deleteProject,
      deleteDrawing,
    },
    drawingModal: {
      drawingProject,
      drawing,
      setDrawing,
      busy,
      saveDrawing,
      closeDrawing,
      upload,
      setError,
    },
  };
}
