import api from "./client";

export function getUsersRequest() {
  return api.get("/users");
}
