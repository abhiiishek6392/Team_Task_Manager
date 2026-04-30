const express = require("express");
const prisma = require("./db");
const { verifyToken, isAdmin } = require("./middleware");

const router = express.Router();

router.get("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        name: "asc"
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    return res.json({ users });
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch users." });
  }
});

module.exports = router;
