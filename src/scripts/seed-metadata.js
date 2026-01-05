/** @format */

require("dotenv").config();
const mongoose = require("mongoose");
const seedMetadata = require("../seeds/metadata.seed");
const { MONGO_URL } = require("../config/var");

async function main() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URL);
    console.log("Connected to MongoDB");

    console.log("Seeding metadata...");
    const result = await seedMetadata();
    console.log("✓ Metadata seeding completed successfully");
    console.log(`✓ ${result.length} records inserted`);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("✗ Error during seeding:", error.message);
    process.exit(1);
  }
}

main();
