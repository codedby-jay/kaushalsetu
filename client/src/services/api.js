import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "/api";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 8000,
});

export async function fetchHealth() {
  const response = await api.get("/health");
  return response.data;
}
