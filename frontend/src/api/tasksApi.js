import api from "./client";

export function getTasksRequest() {
  return api.get("/tasks");
}

export function createTaskRequest({ title, description, dueDate, projectId, assigneeId }) {
  return api.post("/tasks", {
    title,
    description,
    dueDate,
    projectId,
    assigneeId
  });
}

export function updateTaskStatusRequest(taskId, status) {
  return api.patch(`/tasks/${taskId}/status`, { status });
}

export function deleteTaskRequest(taskId) {
  return api.delete(`/tasks/${taskId}`);
}
