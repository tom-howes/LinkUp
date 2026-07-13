const { MongoClient } = require("mongodb");

let client;
let db;

/**
 * Connect to MongoDB using the native driver (no Mongoose).
 * TODO: connect using process.env.MONGO_URI / MONGO_DB_NAME,
 * cache the db instance, and return it.
 */
async function connectDB() {
  // TODO
}

/**
 * TODO: return the cached db instance (throw if not yet connected).
 */
function getDB() {
  // TODO
}

module.exports = { connectDB, getDB };
