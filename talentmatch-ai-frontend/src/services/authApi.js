import { apiRequest, setToken, clearToken } from "./apiClient";

export async function register({ fullName, email, password, role, companyName }) {
  const data = await apiRequest("/auth/register", {
    method: "POST",
    body: { fullName, email, password, role, companyName },
  });
  setToken(data.token);
  return data.user;
}

export async function login({ email, password }) {
  const data = await apiRequest("/auth/login", {
    method: "POST",
    body: { email, password },
  });
  setToken(data.token);
  return data.user;
}

export async function logout() {
  try {
    await apiRequest("/auth/logout", { method: "POST" });
  } finally {
    // Clear the local token regardless of whether the network call
    // succeeded — logging out should always work from the user's side,
    // even if the backend is unreachable.
    clearToken();
  }
}

export async function getMe() {
  return apiRequest("/auth/me");
}

export async function forgotPassword(email) {
  return apiRequest("/auth/forgot-password", { method: "POST", body: { email } });
}
