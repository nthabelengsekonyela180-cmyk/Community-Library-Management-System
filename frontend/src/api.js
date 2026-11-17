const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export async function api(path, options = {}) {
  const token = localStorage.getItem("libraryToken");
  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new Error(data?.message || data || "Something went wrong.");
  }
  return data;
}
