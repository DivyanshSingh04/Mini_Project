const Grievance = require("../models/Grievance");

// @desc    Submit a new grievance
// @route   POST /api/grievances
// @access  Private (citizen)
const submitGrievance = async (req, res, next) => {
  try {
    const { title, description, category, priority } = req.body;

    const grievance = await Grievance.create({
      citizen: req.user._id,
      title,
      description,
      category,
      priority,
      location: {
        village: req.user.village,
        district: req.user.district,
        state: req.user.state,
      },
      statusHistory: [
        {
          status: "pending",
          changedBy: req.user._id,
          remark: "Grievance submitted by citizen.",
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Grievance submitted successfully!",
      ticketId: grievance.ticketId,
      grievance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all grievances of logged-in citizen
// @route   GET /api/grievances/my
// @access  Private (citizen)
const getMyGrievances = async (req, res, next) => {
  try {
    const grievances = await Grievance.find({ citizen: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: grievances.length,
      grievances,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Track grievance by ticket ID (public)
// @route   GET /api/grievances/track/:ticketId
// @access  Public
const trackGrievance = async (req, res, next) => {
  try {
    const grievance = await Grievance.findOne({
      ticketId: req.params.ticketId,
    })
      .populate("citizen", "name village district")
      .populate("assignedOfficer", "name email");

    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: "No grievance found with this ticket ID.",
      });
    }

    res.status(200).json({
      success: true,
      grievance: {
        ticketId: grievance.ticketId,
        title: grievance.title,
        category: grievance.category,
        status: grievance.status,
        priority: grievance.priority,
        location: grievance.location,
        adminRemarks: grievance.adminRemarks,
        statusHistory: grievance.statusHistory,
        submittedOn: grievance.createdAt,
        lastUpdated: grievance.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all grievances (Admin/Officer)
// @route   GET /api/grievances/all
// @access  Private (admin, officer)
const getAllGrievances = async (req, res, next) => {
  try {
    const { status, category, district, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (district) filter["location.district"] = district;

    const skip = (page - 1) * limit;

    const grievances = await Grievance.find(filter)
      .populate("citizen", "name phone village district")
      .populate("assignedOfficer", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Grievance.countDocuments(filter);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      grievances,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update grievance status (Admin/Officer)
// @route   PUT /api/grievances/:id/status
// @access  Private (admin, officer)
const updateGrievanceStatus = async (req, res, next) => {
  try {
    const { status, remark, assignedOfficer } = req.body;

    const grievance = await Grievance.findById(req.params.id);
    if (!grievance) {
      return res.status(404).json({ success: false, message: "Grievance not found." });
    }

    grievance.status = status;
    if (remark) grievance.adminRemarks = remark;
    if (assignedOfficer) grievance.assignedOfficer = assignedOfficer;

    grievance.statusHistory.push({
      status,
      changedBy: req.user._id,
      remark: remark || `Status updated to ${status}`,
    });

    await grievance.save();

    res.status(200).json({
      success: true,
      message: "Grievance status updated.",
      grievance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get grievance stats (Admin dashboard)
// @route   GET /api/grievances/stats
// @access  Private (admin)
const getStats = async (req, res, next) => {
  try {
    const total = await Grievance.countDocuments();
    const pending = await Grievance.countDocuments({ status: "pending" });
    const inProgress = await Grievance.countDocuments({ status: "in_progress" });
    const resolved = await Grievance.countDocuments({ status: "resolved" });
    const rejected = await Grievance.countDocuments({ status: "rejected" });

    const byCategory = await Grievance.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      stats: { total, pending, inProgress, resolved, rejected, byCategory },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitGrievance,
  getMyGrievances,
  trackGrievance,
  getAllGrievances,
  updateGrievanceStatus,
  getStats,
};
