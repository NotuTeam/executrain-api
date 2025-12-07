/** @format */

const mongoose = require("mongoose");

// Cache connection untuk reuse di serverless environment
let cachedConnection = null;

async function dbConnection(MONGO_URL) {
  // Jika sudah ada koneksi yang ready, reuse
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log("Reusing existing database connection");
    return cachedConnection;
  }

  try {
    // Konfigurasi optimal untuk serverless (Vercel)
    const options = {
      // Connection pool settings untuk serverless
      maxPoolSize: 10, // Max connections di pool
      minPoolSize: 2, // Min connections yang tetap alive
      
      // Timeout settings (penting untuk serverless)
      serverSelectionTimeoutMS: 5000, // Timeout untuk select server (5 detik)
      socketTimeoutMS: 45000, // Timeout untuk socket operations (45 detik)
      
      // Buffer commands false untuk avoid antrian
      bufferCommands: false, // Langsung fail jika koneksi belum ready
      
      // Connection management
      maxIdleTimeMS: 10000, // Close idle connections after 10 detik
      heartbeatFrequencyMS: 10000, // Check connection health setiap 10 detik
    };

    mongoose.set("strictQuery", false);
    
    // Connect dengan options yang sudah dioptimasi
    await mongoose.connect(MONGO_URL, options);
    
    // Cache connection untuk reuse
    cachedConnection = mongoose.connection;
    
    console.log("✓ Connected to MongoDB (new connection)");
    
    // Handle connection errors
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
      cachedConnection = null;
    });
    
    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
      cachedConnection = null;
    });
    
    return cachedConnection;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    cachedConnection = null;
    throw error; // Throw error agar bisa di-handle di level atas
  }
}

module.exports = dbConnection;
