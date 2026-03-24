const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.warn("MONGODB_URI not set. Running without database persistence.");
    return;
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000,
      maxPoolSize: 10,
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    console.error(
      "Check MONGODB_URI, MongoDB Atlas Network Access, and database user credentials.",
    );
  }
};

module.exports = connectDB;
