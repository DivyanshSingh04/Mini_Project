const mongoose = require("mongoose");

const grievanceSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      unique: true,
    },
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "water_supply",
        "electricity",
        "sanitation",
        "road",
        "welfare_scheme",
        "healthcare",
        "education",
        "other",
      ],
    },
    location: {
      village: String,
      district: String,
      state: String,
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "resolved", "rejected"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    adminRemarks: {
      type: String,
      default: "",
    },
    statusHistory: [
      {
        status: String,
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        remark: String,
        changedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Auto-generate ticket ID before saving
grievanceSchema.pre("save", function () {
  if (!this.ticketId) {
    this.ticketId =
      "GRV-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
  }
});

module.exports = mongoose.model("Grievance", grievanceSchema);
