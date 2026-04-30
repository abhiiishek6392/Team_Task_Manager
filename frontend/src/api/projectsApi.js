import api from "./client";

export function getProjectsRequest() {
  return api.get("/projects");
}

export function createProjectRequest({ name, description }) {
  return api.post("/projects", { name, description });
}

export function deleteProjectRequest(projectId) {
  return api.delete(`/projects/${projectId}`);
}
