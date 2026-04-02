const express = require("express");
const router = express.Router();
const { getAllUsers, changeUserRole, deleteUser, getDashboard } = require("../controllers/adminController");
const { protect, authorize } = require("../middlewares/authMiddleware");

router.use(protect, authorize("admin")); // All admin routes protected

router.get("/dashboard", getDashboard);
router.get("/users", getAllUsers);
router.put("/users/:id/role", changeUserRole);
router.delete("/users/:id", deleteUser);

module.exports = router;
