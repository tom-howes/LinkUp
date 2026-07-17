const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  register: (body) =>
    request("/api/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) =>
    request("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),
  logout: () => request("/api/auth/logout", { method: "POST" }),
  session: () => request("/api/auth/session"),

  getMe: () => request("/api/users/me"),
  updateMe: (body) =>
    request("/api/users/me", { method: "PUT", body: JSON.stringify(body) }),
  deleteMe: () => request("/api/users/me", { method: "DELETE" }),

  getMatches: () => request("/api/matches/mine"),
  generateMatches: () => request("/api/matches/generate", { method: "POST" }),
  updateMatch: (id, body) =>
    request(`/api/matches/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteMatch: (id) => request(`/api/matches/${id}`, { method: "DELETE" }),
};
