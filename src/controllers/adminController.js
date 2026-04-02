const User = require("../models/User");
const Grievance = require("../models/Grievance");

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (admin)
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: "citizen" }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

// @desc    Change user role (make officer etc.)
// @route   PUT /api/admin/users/:id/role
// @access  Private (admin)
const changeUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    res.status(200).json({ success: true, message: `User role updated to ${role}.`, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private (admin)
const deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "User deleted successfully." });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin dashboard overview
// @route   GET /api/admin/dashboard
// @access  Private (admin)
const getDashboard = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: "citizen" });
    const totalGrievances = await Grievance.countDocuments();
    const pendingGrievances = await Grievance.countDocuments({ status: "pending" });
    const resolvedGrievances = await Grievance.countDocuments({ status: "resolved" });

    const recentGrievances = await Grievance.find()
      .populate("citizen", "name village district")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      dashboard: {
        totalUsers,
        totalGrievances,
        pendingGrievances,
        resolvedGrievances,
        recentGrievances,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, changeUserRole, deleteUser, getDashboard };
