const Scheme = require("../models/Scheme");

// @desc    Get all active government schemes
// @route   GET /api/schemes
// @access  Public
const getAllSchemes = async (req, res, next) => {
  try {
    const { category, gender, search } = req.query;

    const filter = { isActive: true };
    if (category) filter.category = category;
    if (gender) filter["eligibility.gender"] = { $in: [gender, "all"] };
    if (search) filter.name = { $regex: search, $options: "i" };

    const schemes = await Scheme.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: schemes.length,
      schemes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single scheme by ID
// @route   GET /api/schemes/:id
// @access  Public
const getSchemeById = async (req, res, next) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) {
      return res.status(404).json({ success: false, message: "Scheme not found." });
    }
    res.status(200).json({ success: true, scheme });
  } catch (error) {
    next(error);
  }
};

// @desc    Check eligibility for a scheme
// @route   POST /api/schemes/:id/check-eligibility
// @access  Private (citizen)
const checkEligibility = async (req, res, next) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) {
      return res.status(404).json({ success: false, message: "Scheme not found." });
    }

    const user = req.user;
    const { minAge, maxAge, gender } = scheme.eligibility;
    const reasons = [];

    if (user.age < minAge) reasons.push(`Minimum age required is ${minAge}.`);
    if (user.age > maxAge) reasons.push(`Maximum age limit is ${maxAge}.`);
    if (gender !== "all" && user.gender && user.gender !== gender) {
      reasons.push(`This scheme is only for ${gender}.`);
    }

    if (reasons.length === 0) {
      return res.status(200).json({
        success: true,
        eligible: true,
        message: "You are eligible for this scheme!",
        scheme: { name: scheme.name, benefits: scheme.benefits, applicationProcess: scheme.applicationProcess },
      });
    }

    res.status(200).json({
      success: true,
      eligible: false,
      message: "You are not eligible for this scheme.",
      reasons,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new scheme (Admin only)
// @route   POST /api/schemes
// @access  Private (admin)
const addScheme = async (req, res, next) => {
  try {
    const scheme = await Scheme.create({ ...req.body, addedBy: req.user._id });
    res.status(201).json({ success: true, message: "Scheme added successfully.", scheme });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a scheme (Admin only)
// @route   PUT /api/schemes/:id
// @access  Private (admin)
const updateScheme = async (req, res, next) => {
  try {
    const scheme = await Scheme.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!scheme) {
      return res.status(404).json({ success: false, message: "Scheme not found." });
    }
    res.status(200).json({ success: true, message: "Scheme updated.", scheme });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a scheme (Admin only)
// @route   DELETE /api/schemes/:id
// @access  Private (admin)
const deleteScheme = async (req, res, next) => {
  try {
    await Scheme.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Scheme deleted successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllSchemes, getSchemeById, checkEligibility, addScheme, updateScheme, deleteScheme };
