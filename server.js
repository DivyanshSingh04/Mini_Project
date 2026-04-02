const dotenv = require("dotenv");
dotenv.config();

const app = require("./src/app");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 5000;

// Connect to Database then start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("=========================================");
    console.log(`🌾  e-GramSAARTHI Server Started`);
    console.log(`🚀  Running on: http://localhost:${PORT}`);
    console.log(`📦  Environment: ${process.env.NODE_ENV || "development"}`);
    console.log("=========================================");
  });
});
