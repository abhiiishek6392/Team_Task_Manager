const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./auth");
const projectRoutes = require("./projects");
const taskRoutes = require("./tasks");
const userRoutes = require("./users");

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0";

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);

function healthCheck(req, res) {
  res.json({ status: "ok", service: "team-task-manager-api" });
}

app.get("/health", healthCheck);
app.get("/api/health", healthCheck);

app.listen(PORT, HOST, () => {
  console.log(`Server is running on ${HOST}:${PORT}`);
});
