import axios from "axios";
import { getStoredToken } from "../utils/authStorage.js";

const baseURL = import.meta.env.VITE_API_URL || "/api";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 8000,
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function fetchHealth() {
  const response = await api.get("/health");
  return response.data;
}

export async function registerRequest(payload) {
  const response = await api.post("/auth/register", payload);
  return response.data;
}

export async function loginRequest(payload) {
  const response = await api.post("/auth/login", payload);
  return response.data;
}

export async function fetchCurrentUser() {
  const response = await api.get("/auth/me");
  return response.data;
}

export function getApiErrorMessage(error, fallback = "Something went wrong") {
  return error.response?.data?.message || fallback;
}

export async function getStudentProfile() {
  const response = await api.get("/student/profile");
  return response.data;
}

export async function createStudentProfile(data) {
  const response = await api.post("/student/profile", data);
  return response.data;
}

export async function updateStudentProfile(data) {
  const response = await api.put("/student/profile", data);
  return response.data;
}

export async function deleteStudentProfile() {
  const response = await api.delete("/student/profile");
  return response.data;
}

export async function getSkills() {
  const response = await api.get("/skills");
  return response.data;
}

export async function getStudentSkills() {
  const response = await api.get("/student/skills");
  return response.data;
}

export async function addStudentSkill(data) {
  const response = await api.post("/student/skills", data);
  return response.data;
}

export async function updateStudentSkill(skillId, data) {
  const response = await api.put(`/student/skills/${skillId}`, data);
  return response.data;
}

export async function removeStudentSkill(skillId) {
  const response = await api.delete(`/student/skills/${skillId}`);
  return response.data;
}
