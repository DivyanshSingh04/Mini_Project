const express = require("express");
const router = express.Router();
const {
  getAllSchemes,
  getSchemeById,
  checkEligibility,
  addScheme,
  updateScheme,
  deleteScheme,
} = require("../controllers/schemeController");
const { protect, authorize } = require("../middlewares/authMiddleware");

// Public routes
router.get("/", getAllSchemes);
router.get("/:id", getSchemeById);

// Citizen - check eligibility
router.post("/:id/check-eligibility", protect, checkEligibility);

// Admin only
router.post("/", protect, authorize("admin"), addScheme);
router.put("/:id", protect, authorize("admin"), updateScheme);
router.delete("/:id", protect, authorize("admin"), deleteScheme);

module.exports = router;
