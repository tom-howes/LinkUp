const { MongoClient } = require("mongodb");

let client;
let db;

/**
 * Connect to MongoDB using the native driver (no Mongoose).
 */
async function connectDB() {
  if (db) return db;
  client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  db = client.db(process.env.MONGO_DB_NAME);
  return db;
}

function getDB() {
  if (!db) throw new Error("DB not connected. Call connectDB() first.");
  return db;
}

module.exports = { connectDB, getDB };
