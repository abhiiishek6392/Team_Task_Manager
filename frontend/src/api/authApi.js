import api from "./client";

export function loginRequest({ email, password }) {
  return api.post("/auth/login", { email, password });
}

export function registerRequest({ name, email, password, role }) {
  return api.post("/auth/register", {
    name,
    email,
    password,
    role
  });
}
