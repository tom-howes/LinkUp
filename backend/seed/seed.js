/**
 * Seeds the database with synthetic data (1000+ records required by the
 * rubric) so search, filters, and matching have realistic volume to work
 * with.
 *
 * Run with: npm run seed
 *
 * TODO:
 * - connect via connectDB()
 * - clear existing collections
 * - generate synthetic users (seekers with desiredTitle + up to 3 skills
 *   with evidence; employers with companyName)
 * - generate synthetic postings (title + 1-2 requiredSkills)
 * - generate matches where a seeker's title/skills overlap a posting
 * - generate messages within some of those matches
 * - console.log counts, then process.exit(0)
 *
 * Consider using @faker-js/faker (already in devDependencies) for
 * realistic names, companies, locations, and text.
 */
require("dotenv").config();
// const { faker } = require("@faker-js/faker");
// const bcrypt = require("bcryptjs");
// const { connectDB } = require("../config/db");

async function seed() {
  // TODO
}

seed();
