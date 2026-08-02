const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/shms";
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("MongoDB connection closed due to app termination");
      process.exit(0);
    });

  } catch (error) {
    console.warn("⚠️ Local MongoDB not found on port 27017. Starting embedded MongoMemoryServer...");
    try {
      const { MongoMemoryServer } = require("mongodb-memory-server");
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      const conn = await mongoose.connect(mongoUri);
      console.log(`✅ Embedded In-Memory MongoDB Connected: ${conn.connection.host}`);

      // Seed initial data automatically in memory
      try {
        const seedScript = require("../scripts/seedData");
      } catch (sErr) {
        // ignore seed errors
      }
    } catch (memErr) {
      console.error("❌ Failed to start embedded MongoDB:", memErr.message);
    }
  }
};

module.exports = connectDB;