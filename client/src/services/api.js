import axios from "axios";
import { getStoredToken } from "../utils/authStorage.js";

const baseURL = import.meta.env.VITE_API_URL || "/api";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
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

export async function getAssessments() {
  const response = await api.get("/assessments");
  return response.data;
}

export async function getAssessment(id) {
  const response = await api.get(`/assessments/${id}`);
  return response.data;
}

export async function startAssessment(id) {
  const response = await api.post(`/assessments/${id}/start`);
  return response.data;
}

export async function submitAssessment(id, payload) {
  const response = await api.post(`/assessments/${id}/submit`, payload);
  return response.data;
}

export async function getAssessmentHistory() {
  const response = await api.get("/student/assessments/history");
  return response.data;
}

export async function getAssessmentResult(attemptId) {
  const response = await api.get(`/student/assessment-results/${attemptId}`);
  return response.data;
}

export async function getSkillIntelligence() {
  const response = await api.get("/student/skill-intelligence");
  return response.data;
}
