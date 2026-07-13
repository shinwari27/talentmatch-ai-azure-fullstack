const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const TOKEN_KEY = "talentmatch_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Thin wrapper around fetch that:
 * - Prefixes every call with the API base URL
 * - Attaches the stored JWT as a Bearer token, if one exists
 * - Parses JSON responses and throws a real Error (with the backend's own
 *   message) on any non-2xx status, so callers can just try/catch instead
 *   of checking response.ok everywhere
 */
export async function apiRequest(path, { method = "GET", body, headers = {} } = {}) {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // 204 No Content has no body to parse
  if (response.status === 204) return null;

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message = data?.error || `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.details = data?.details;
    throw error;
  }

  return data;
}

/**
 * Separate from apiRequest because file uploads use multipart/form-data,
 * not JSON — the browser sets the correct Content-Type boundary itself
 * when given a FormData body, so we deliberately don't set Content-Type
 * here (setting it manually breaks the multipart boundary).
 */
export async function apiUpload(path, formData) {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message = data?.error || `Upload failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}
