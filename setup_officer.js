require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./src/models/User");

const seedOfficer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB database ✅");

    const officerEmail = "officer@egram.com";
    const existing = await User.findOne({ email: officerEmail });

    if (existing) {
      existing.role = "officer";
      await existing.save();
      console.log(`Updated existing user ${officerEmail} to role "officer" ✅`);
    } else {
      const officer = await User.create({
        name: "Ramesh Kumar (Officer)",
        email: officerEmail,
        password: "password123", // Will be hashed by pre-save hook
        phone: "9876543210",
        age: 35,
        village: "Default Village",
        district: "Default District",
        state: "Default State",
        role: "officer",
      });
      console.log(`Created new officer account: ${officerEmail} with password: password123 ✅`);
    }

    process.exit(0);
  } catch (error) {
    console.error("Error setting up officer:", error);
    process.exit(1);
  }
};

seedOfficer();
