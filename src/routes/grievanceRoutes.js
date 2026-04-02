const express = require("express");
const router = express.Router();
const {
  submitGrievance,
  getMyGrievances,
  trackGrievance,
  getAllGrievances,
  updateGrievanceStatus,
  getStats,
} = require("../controllers/grievanceController");
const { protect, authorize } = require("../middlewares/authMiddleware");

// Public route - anyone can track by ticket ID
router.get("/track/:ticketId", trackGrievance);

// Citizen routes
router.post("/", protect, authorize("citizen"), submitGrievance);
router.get("/my", protect, authorize("citizen"), getMyGrievances);

// Admin / Officer routes
router.get("/all", protect, authorize("admin", "officer"), getAllGrievances);
router.get("/stats", protect, authorize("admin"), getStats);
router.put("/:id/status", protect, authorize("admin", "officer"), updateGrievanceStatus);

module.exports = router;
