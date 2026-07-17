// Relative by default: in dev CRA proxies "/api" to the backend (see the
// "proxy" field in package.json); in production Express serves this app from
// the same origin. Override with REACT_APP_API_URL for a split deployment.
const BASE = process.env.REACT_APP_API_URL || "";

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

  // Postings (Thomas)
  getPostings: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v != null))
    ).toString();
    return request(`/api/postings${qs ? `?${qs}` : ""}`);
  },
  getMyPostings: () => request("/api/postings/mine"),
  getPosting: (id) => request(`/api/postings/${id}`),
  createPosting: (body) =>
    request("/api/postings", { method: "POST", body: JSON.stringify(body) }),
  updatePosting: (id, body) =>
    request(`/api/postings/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deletePosting: (id) => request(`/api/postings/${id}`, { method: "DELETE" }),

  // Messages (Thomas)
  getMessages: (matchId) => request(`/api/messages/${matchId}`),
  sendMessage: (matchId, text) =>
    request(`/api/messages/${matchId}`, {
      method: "POST",
      body: JSON.stringify({ text }),
    }),
  updateMessage: (id, text) =>
    request(`/api/messages/message/${id}`, {
      method: "PUT",
      body: JSON.stringify({ text }),
    }),
  deleteMessage: (id) => request(`/api/messages/message/${id}`, { method: "DELETE" }),
};
