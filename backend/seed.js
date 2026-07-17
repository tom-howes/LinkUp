/**
 * Seeds the database with synthetic data (1000+ records required by the
 * rubric) so search, filters, and matching have realistic volume to work
 * with.
 *
 * Run with: npm run seed
 */
require("dotenv").config();
const { faker } = require("@faker-js/faker");
const bcrypt = require("bcryptjs");
const { connectDB } = require("./config/db");

const TITLES = [
  "Frontend Developer",
  "Backend Developer",
  "Data Analyst",
  "Product Manager",
  "UX Designer",
  "DevOps Engineer",
];

const SKILLS = [
  "React",
  "Node.js",
  "Python",
  "SQL",
  "AWS",
  "Figma",
  "TypeScript",
  "Docker",
  "MongoDB",
  "Communication",
];

function pickSkills(n) {
  return faker.helpers.arrayElements(SKILLS, n);
}

async function seed() {
  const db = await connectDB();

  await Promise.all([
    db.collection("users").deleteMany({}),
    db.collection("postings").deleteMany({}),
    db.collection("matches").deleteMany({}),
    db.collection("messages").deleteMany({}),
  ]);

  const hash = await bcrypt.hash("password123", 10);

  const seekers = [];
  for (let i = 0; i < 500; i++) {
    const title = faker.helpers.arrayElement(TITLES);
    const skillNames = pickSkills(faker.number.int({ min: 1, max: 3 }));
    seekers.push({
      email: faker.internet.email().toLowerCase(),
      password: hash,
      role: "seeker",
      desiredTitle: title,
      skills: skillNames.map((name) => ({
        name,
        evidence: faker.lorem.sentence(),
      })),
      createdAt: new Date(),
    });
  }
  const seekerRes = await db.collection("users").insertMany(seekers);
  const seekerIds = Object.values(seekerRes.insertedIds);

  const employers = [];
  for (let i = 0; i < 200; i++) {
    employers.push({
      email: faker.internet.email().toLowerCase(),
      password: hash,
      role: "employer",
      companyName: faker.company.name(),
      createdAt: new Date(),
    });
  }
  const empRes = await db.collection("users").insertMany(employers);
  const empIds = Object.values(empRes.insertedIds);

  const postings = [];
  for (let i = 0; i < 400; i++) {
    const title = faker.helpers.arrayElement(TITLES);
    postings.push({
      title,
      requiredSkills: pickSkills(faker.number.int({ min: 1, max: 2 })),
      description: faker.lorem.paragraph(),
      location: faker.location.city(),
      posterId: faker.helpers.arrayElement(empIds),
      status: "open",
      createdAt: new Date(),
    });
  }
  const postRes = await db.collection("postings").insertMany(postings);
  const postDocs = postings.map((p, i) => ({
    ...p,
    _id: Object.values(postRes.insertedIds)[i],
  }));

  const seekerDocs = seekers.map((s, i) => ({ ...s, _id: seekerIds[i] }));

  const norm = (x) => String(x || "").trim().toLowerCase();

  const matches = [];
  for (const s of seekerDocs) {
    const sSkills = new Set(s.skills.map((sk) => norm(sk.name)));
    const eligible = postDocs.filter((p) => {
      if (norm(p.title) !== norm(s.desiredTitle)) return false;
      return (p.requiredSkills || []).some((r) => sSkills.has(norm(r)));
    });
    for (const p of faker.helpers.arrayElements(
      eligible,
      Math.min(eligible.length, 3)
    )) {
      const matched = (p.requiredSkills || [])
        .map(norm)
        .filter((r) => sSkills.has(r));
      matches.push({
        seekerId: s._id,
        postingId: p._id,
        posterId: p.posterId,
        matchedSkills: matched,
        status: faker.helpers.arrayElement(["pending", "unlocked"]),
        createdAt: new Date(),
      });
    }
  }
  const matchRes = matches.length
    ? await db.collection("matches").insertMany(matches)
    : { insertedIds: {} };
  const matchDocs = matches.map((m, i) => ({
    ...m,
    _id: Object.values(matchRes.insertedIds)[i],
  }));

  const messages = [];
  for (const m of matchDocs.filter((m) => m.status === "unlocked")) {
    const n = faker.number.int({ min: 1, max: 6 });
    for (let i = 0; i < n; i++) {
      const sender = faker.helpers.arrayElement([m.seekerId, m.posterId]);
      messages.push({
        matchId: m._id,
        senderId: sender,
        text: faker.lorem.sentence(),
        timestamp: faker.date.recent({ days: 14 }),
      });
    }
  }
  if (messages.length) await db.collection("messages").insertMany(messages);

  console.log("Seeded:");
  console.log(`  users:    ${seekers.length + employers.length}`);
  console.log(`  postings: ${postings.length}`);
  console.log(`  matches:  ${matches.length}`);
  console.log(`  messages: ${messages.length}`);
  console.log(
    `  total:    ${
      seekers.length +
      employers.length +
      postings.length +
      matches.length +
      messages.length
    }`
  );

  process.exit(0);
}

seed();