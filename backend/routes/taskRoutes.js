const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");

// PERBAIKAN: Menambahkan kurung kurawal {} untuk mengambil fungsi verifyToken
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/", verifyToken, taskController.getTasks);
router.post("/", verifyToken, taskController.createTask);
router.post("/timer/start", verifyToken, taskController.startTimer);
router.post("/timer/stop", verifyToken, taskController.stopTimer);
router.get("/analytics", verifyToken, taskController.getAdminAnalytics);
router.put("/:id", verifyToken, taskController.updateTask);
router.delete("/:id", verifyToken, taskController.deleteTask);

module.exports = router;
