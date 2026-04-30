const express = require("express");
const prisma = require("./db");
const { verifyToken, isAdmin } = require("./middleware");

const router = express.Router();

router.post("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Project name is required." });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description: description || null
      }
    });

    return res.status(201).json({ project });
  } catch (error) {
    return res.status(500).json({ message: "Project creation failed." });
  }
});

router.get("/", verifyToken, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: {
        createdAt: "desc"
      }
    });

    return res.json({ projects });
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch projects." });
  }
});

router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id }
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    await prisma.project.delete({
      where: { id }
    });

    return res.json({ message: "Project deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Project deletion failed." });
  }
});

module.exports = router;
