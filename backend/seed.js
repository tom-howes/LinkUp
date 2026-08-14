/**
 * Seeds the database with synthetic data so search, filtering and matching all
 * have realistic volume behind them (well over the 1,000 records the project
 * requires - see the summary this prints at the end).
 *
 * It also creates two fixed demo accounts with a profile, postings, matches and
 * a live chat thread already set up. Those are what the landing page's "Use
 * jobseeker demo" / "Use employer demo" buttons load, and what usability-study
 * participants sign in with, so the app is never first seen empty.
 *
 * Run with: npm run seed
 */
require("dotenv").config();
const { faker } = require("@faker-js/faker");
const bcrypt = require("bcryptjs");
const { connectDB } = require("./config/db");

const DEMO_PASSWORD = "password123";

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

// Evidence is the whole point of a LinkUp profile, so the synthetic version
// reads like something a person would actually write rather than lorem ipsum.
const EVIDENCE_TEMPLATES = [
  (skill) =>
    `Built and shipped a ${skill} feature used by ${faker.number.int({ min: 200, max: 40000 })} people.`,
  (skill) =>
    `Completed a ${skill} certification and applied it on a ${faker.company.buzzNoun()} project.`,
  (skill) =>
    `Rewrote our ${faker.company.buzzNoun()} pipeline in ${skill}, cutting runtime by ${faker.number.int({ min: 15, max: 70 })}%.`,
  (skill) => `Two years using ${skill} day to day at ${faker.company.name()}.`,
  (skill) =>
    `Open-source ${skill} project with ${faker.number.int({ min: 20, max: 900 })} stars on GitHub.`,
  (skill) =>
    `Led a team of ${faker.number.int({ min: 2, max: 8 })} delivering a ${skill} migration.`,
];

function evidenceFor(skill) {
  return faker.helpers.arrayElement(EVIDENCE_TEMPLATES)(skill);
}

function pickSkills(n) {
  return faker.helpers.arrayElements(SKILLS, n);
}

const norm = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

/**
 * Indexes for the queries the app actually runs: the browse/search filter, the
 * "my postings" and "my matches" lookups, and the message thread read.
 */
async function createIndexes(db) {
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("users").createIndex({ role: 1, desiredTitle: 1 });
  await db.collection("postings").createIndex({ status: 1, createdAt: -1 });
  await db.collection("postings").createIndex({ posterId: 1, createdAt: -1 });
  await db.collection("postings").createIndex({ title: 1 });
  await db.collection("matches").createIndex({ seekerId: 1, postingId: 1 });
  await db.collection("matches").createIndex({ posterId: 1 });
  await db.collection("messages").createIndex({ matchId: 1, timestamp: 1 });
}

async function seed() {
  const db = await connectDB();

  await Promise.all([
    db.collection("users").deleteMany({}),
    db.collection("postings").deleteMany({}),
    db.collection("matches").deleteMany({}),
    db.collection("messages").deleteMany({}),
  ]);

  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // ------------------------------------------------------------- demo users

  const demoSeeker = {
    email: "demo.seeker@linkup.app",
    password: hash,
    role: "seeker",
    desiredTitle: "Frontend Developer",
    skills: [
      {
        name: "React",
        evidence:
          "Built a 12-screen internal dashboard in React during my final-year project, used by the whole department.",
      },
      {
        name: "TypeScript",
        evidence:
          "Migrated a 20k-line codebase from JavaScript to TypeScript and cut runtime type errors to near zero.",
      },
      {
        name: "Figma",
        evidence:
          "Designed and prototyped the dashboard in Figma before building it, including an accessibility pass.",
      },
    ],
    createdAt: new Date(),
  };

  const demoEmployer = {
    email: "demo.employer@linkup.app",
    password: hash,
    role: "employer",
    companyName: "Northwind Robotics",
    createdAt: new Date(),
  };

  // --------------------------------------------------------- synthetic users

  const seekers = [];
  for (let i = 0; i < 500; i++) {
    const skillNames = pickSkills(faker.number.int({ min: 1, max: 3 }));
    seekers.push({
      email: faker.internet.email({ provider: `mail${i}.example.com` }).toLowerCase(),
      password: hash,
      role: "seeker",
      desiredTitle: faker.helpers.arrayElement(TITLES),
      skills: skillNames.map((name) => ({ name, evidence: evidenceFor(name) })),
      createdAt: faker.date.recent({ days: 90 }),
    });
  }

  const employers = [];
  for (let i = 0; i < 200; i++) {
    employers.push({
      email: faker.internet.email({ provider: `corp${i}.example.com` }).toLowerCase(),
      password: hash,
      role: "employer",
      companyName: faker.company.name(),
      createdAt: faker.date.recent({ days: 90 }),
    });
  }

  const userRes = await db
    .collection("users")
    .insertMany([demoSeeker, demoEmployer, ...seekers, ...employers]);
  const userIds = Object.values(userRes.insertedIds);

  const demoSeekerId = userIds[0];
  const demoEmployerId = userIds[1];
  const seekerDocs = seekers.map((s, i) => ({ ...s, _id: userIds[i + 2] }));
  const employerIds = employers.map((_, i) => userIds[i + 2 + seekers.length]);

  const allSeekerDocs = [{ ...demoSeeker, _id: demoSeekerId }, ...seekerDocs];

  // ------------------------------------------------------------- demo postings

  // Two of these are deliberately built to match the demo seeker, so the demo
  // employer's Matches screen is never empty either.
  const demoPostings = [
    {
      title: "Frontend Developer",
      requiredSkills: ["React", "TypeScript"],
      description:
        "Own the operator console our field engineers use every day. You will work directly with the design team and ship to production most weeks.",
      location: "Boston, MA (hybrid)",
      posterId: demoEmployerId,
      status: "open",
      createdAt: new Date(),
    },
    {
      title: "Frontend Developer",
      requiredSkills: ["Figma"],
      description:
        "A design-leaning frontend role: you will take our component library from a Figma file to a documented, accessible React implementation.",
      location: "Remote (US)",
      posterId: demoEmployerId,
      status: "open",
      createdAt: new Date(),
    },
    {
      title: "DevOps Engineer",
      requiredSkills: ["Docker", "AWS"],
      description:
        "Keep the fleet deploying. Container builds, staged rollouts and the on-call rotation that goes with them.",
      location: "Boston, MA",
      posterId: demoEmployerId,
      status: "open",
      createdAt: new Date(),
    },
  ];

  const postings = [];
  for (let i = 0; i < 400; i++) {
    postings.push({
      title: faker.helpers.arrayElement(TITLES),
      requiredSkills: pickSkills(faker.number.int({ min: 1, max: 2 })),
      description: faker.lorem.paragraph(),
      location: `${faker.location.city()}, ${faker.location.state({ abbreviated: true })}`,
      posterId: faker.helpers.arrayElement(employerIds),
      status: faker.helpers.weightedArrayElement([
        { weight: 9, value: "open" },
        { weight: 1, value: "closed" },
      ]),
      createdAt: faker.date.recent({ days: 60 }),
    });
  }

  const postingRes = await db
    .collection("postings")
    .insertMany([...demoPostings, ...postings]);
  const postingIds = Object.values(postingRes.insertedIds);
  const postingDocs = [...demoPostings, ...postings].map((p, i) => ({
    ...p,
    _id: postingIds[i],
  }));

  // ---------------------------------------------------------------- matches

  const openPostings = postingDocs.filter((p) => p.status !== "closed");
  const matches = [];

  for (const seeker of allSeekerDocs) {
    const seekerSkills = new Set(seeker.skills.map((s) => norm(s.name)));
    const eligible = openPostings.filter(
      (p) =>
        norm(p.title) === norm(seeker.desiredTitle) &&
        (p.requiredSkills || []).some((r) => seekerSkills.has(norm(r)))
    );

    // The demo seeker keeps every match it qualifies for; everyone else gets a
    // realistic handful so the collection doesn't balloon.
    const isDemo = seeker._id.equals(demoSeekerId);
    const chosen = isDemo
      ? eligible
      : faker.helpers.arrayElements(eligible, Math.min(eligible.length, 3));

    for (const posting of chosen) {
      matches.push({
        seekerId: seeker._id,
        postingId: posting._id,
        posterId: posting.posterId,
        matchedSkills: (posting.requiredSkills || [])
          .map(norm)
          .filter((r) => seekerSkills.has(r)),
        status: isDemo
          ? "pending"
          : faker.helpers.arrayElement(["pending", "unlocked", "dismissed"]),
        createdAt: faker.date.recent({ days: 30 }),
      });
    }
  }

  // Give the demo pair one already-unlocked conversation to look at.
  const demoMatch = matches.find(
    (m) => m.seekerId.equals(demoSeekerId) && m.posterId.equals(demoEmployerId)
  );
  if (demoMatch) demoMatch.status = "unlocked";

  const matchRes = await db.collection("matches").insertMany(matches);
  const matchIds = Object.values(matchRes.insertedIds);
  const matchDocs = matches.map((m, i) => ({ ...m, _id: matchIds[i] }));

  // --------------------------------------------------------------- messages

  const messages = [];
  for (const match of matchDocs.filter((m) => m.status === "unlocked")) {
    const count = faker.number.int({ min: 1, max: 6 });
    for (let i = 0; i < count; i++) {
      messages.push({
        matchId: match._id,
        senderId: faker.helpers.arrayElement([match.seekerId, match.posterId]),
        text: faker.lorem.sentence(),
        timestamp: faker.date.recent({ days: 14 }),
      });
    }
  }

  // A scripted thread on the demo match, so the demo chat reads like a real one.
  const demoMatchDoc = matchDocs.find(
    (m) => m.seekerId.equals(demoSeekerId) && m.posterId.equals(demoEmployerId)
  );
  if (demoMatchDoc) {
    const script = [
      [
        demoEmployerId,
        "Hi! Your dashboard project is exactly the kind of work this role involves. How did you handle the state management?",
      ],
      [
        demoSeekerId,
        "Thanks! Mostly local state plus a small context for the auth session - I wanted to avoid pulling in Redux for 12 screens.",
      ],
      [
        demoEmployerId,
        "Sensible. Did the accessibility pass come before or after the build?",
      ],
      [
        demoSeekerId,
        "Before, in Figma - contrast and focus order were part of the design, then I checked the built version with axe.",
      ],
    ];
    script.forEach(([senderId, text], i) => {
      messages.push({
        matchId: demoMatchDoc._id,
        senderId,
        text,
        timestamp: new Date(Date.now() - (script.length - i) * 3600 * 1000),
      });
    });
  }

  await db.collection("messages").insertMany(messages);

  await createIndexes(db);

  const userCount = seekers.length + employers.length + 2;
  const postingCount = postingDocs.length;
  const total = userCount + postingCount + matches.length + messages.length;

  console.log("Seeded:");
  console.log(`  users:    ${userCount}`);
  console.log(`  postings: ${postingCount}`);
  console.log(`  matches:  ${matches.length}`);
  console.log(`  messages: ${messages.length}`);
  console.log(`  total:    ${total} documents`);
  console.log("");
  console.log("Demo accounts (password: " + DEMO_PASSWORD + ")");
  console.log("  jobseeker: demo.seeker@linkup.app");
  console.log("  employer:  demo.employer@linkup.app");

  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
