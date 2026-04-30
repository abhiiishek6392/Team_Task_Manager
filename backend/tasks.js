const express = require("express");
const prisma = require("./db");
const { verifyToken, isAdmin } = require("./middleware");

const router = express.Router();
const allowedStatuses = ["TODO", "IN_PROGRESS", "DONE"];

router.post("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const { title, description, dueDate, projectId, assigneeId } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ message: "Title and projectId are required." });
    }

    let parsedDueDate = null;

    if (dueDate) {
      parsedDueDate = new Date(dueDate);

      if (Number.isNaN(parsedDueDate.getTime())) {
        return res.status(400).json({ message: "dueDate must be a valid date." });
      }
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    if (assigneeId) {
      const assignee = await prisma.user.findUnique({
        where: { id: assigneeId }
      });

      if (!assignee) {
        return res.status(404).json({ message: "Assignee not found." });
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        dueDate: parsedDueDate,
        projectId,
        assigneeId: assigneeId || null
      },
      include: {
        project: true,
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    return res.status(201).json({ task });
  } catch (error) {
    return res.status(500).json({ message: "Task creation failed." });
  }
});

router.get("/", verifyToken, async (req, res) => {
  try {
    const where = req.user.role === "ADMIN" ? {} : { assigneeId: req.user.id };

    const tasks = await prisma.task.findMany({
      where,
      orderBy: {
        createdAt: "desc"
      },
      include: {
        project: true,
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    return res.json({ tasks });
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch tasks." });
  }
});

router.patch("/:id/status", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Status must be TODO, IN_PROGRESS, or DONE." });
    }

    const existingTask = await prisma.task.findUnique({
      where: { id }
    });

    if (!existingTask) {
      return res.status(404).json({ message: "Task not found." });
    }

    if (req.user.role !== "ADMIN" && existingTask.assigneeId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden: you can only update assigned tasks." });
    }

    const task = await prisma.task.update({
      where: { id },
      data: { status },
      include: {
        project: true,
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    return res.json({ task });
  } catch (error) {
    return res.status(500).json({ message: "Task status update failed." });
  }
});

router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const existingTask = await prisma.task.findUnique({
      where: { id }
    });

    if (!existingTask) {
      return res.status(404).json({ message: "Task not found." });
    }

    await prisma.task.delete({
      where: { id }
    });

    return res.json({ message: "Task deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Task deletion failed." });
  }
});

module.exports = router;
