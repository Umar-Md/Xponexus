const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
}
export const api = {
  projects: () => request("/projects"),
  adminProjects: () => request("/admin/projects"),
  login: (body) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  logout: () => request("/auth/logout", { method: "POST" }),
  me: () => request("/auth/me"),
  createProject: (body) =>
    request("/admin/projects", { method: "POST", body: JSON.stringify(body) }),
  updateProject: (id, body) =>
    request(`/admin/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  deleteProject: (id) => request(`/admin/projects/${id}`, { method: "DELETE" }),
  updateProjectPdf: (id, pdf) => request(`/admin/projects/${id}/pdf`, {
    method: "PATCH", body: JSON.stringify({ pdf }),
  }),
  createDrawing: (id, body) =>
    request(`/admin/projects/${id}/drawings`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateDrawing: (id, body) =>
    request(`/admin/drawings/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  deleteDrawing: (id) => request(`/admin/drawings/${id}`, { method: "DELETE" }),
  upload: (form) => request("/upload", { method: "POST", body: form }),
};
