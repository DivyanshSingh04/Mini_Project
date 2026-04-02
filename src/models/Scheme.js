const mongoose = require("mongoose");

const schemeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Scheme name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        "agriculture",
        "health",
        "education",
        "housing",
        "finance",
        "employment",
        "women_welfare",
        "other",
      ],
      required: true,
    },
    eligibility: {
      minAge: { type: Number, default: 18 },
      maxAge: { type: Number, default: 99 },
      gender: {
        type: String,
        enum: ["all", "male", "female"],
        default: "all",
      },
      incomeLimit: { type: Number, default: null },
      description: String,
    },
    benefits: {
      type: String,
      required: true,
    },
    applicationProcess: {
      type: String,
    },
    documentsRequired: [String],
    officialLink: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Scheme", schemeSchema);
