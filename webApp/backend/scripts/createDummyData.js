// createDummyData.js
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcrypt";

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/entity_pulse_users";

const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["user", "admin"], default: "user" },
});
const historySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sentence: { type: String, required: true },
  sentimentResult: { type: Object, required: true },
  entities: { type: Array, default: [] },
  inputMethod: { type: String, enum: ["text", "image", "voice"], default: "text" },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);
const History = mongoose.model("History", historySchema);

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

async function main() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log("Connected to MongoDB:", MONGO_URI);

  // create/ensure users
  const usersData = [
    { username: "Admin User", email: "admin@gmail.com", password: "adminpass", role: "admin" },
    { username: "Alice", email: "alice@example.com", password: "alicepass", role: "user" },
    { username: "Bob", email: "bob@example.com", password: "bobpass", role: "user" },
    { username: "Charlie", email: "charlie@example.com", password: "charliepass", role: "user" },
  ];

  const createdUsers = [];
  for (const u of usersData) {
    let existing = await User.findOne({ email: u.email });
    if (existing) {
      createdUsers.push(existing);
      continue;
    }
    const hashed = await bcrypt.hash(u.password, 10);
    const doc = await User.create({ username: u.username, email: u.email, password: hashed, role: u.role });
    createdUsers.push(doc);
  }

  // sample pools for diversity
  const sampleEntitiesPool = [
    "TCS", "Infosys", "Reliance", "HDFC", "ICICI", "Wipro", "Adani", "Bajaj", "TechM"
  ];
  const sentimentOptions = [
    { label: "Positive", low: 0.6, high: 0.99 },
    { label: "Neutral", low: 0.3, high: 0.6 },
    { label: "Negative", low: 0.0, high: 0.35 },
  ];
  const inputMethods = ["text", "image", "voice"];

  // build 30 days of histories (from 29 days ago until today)
  const days = 30;
  const now = new Date();
  const histories = [];

  for (let d = days - 1; d >= 0; d--) {
    const dayBase = new Date(now);
    dayBase.setDate(now.getDate() - d);
    dayBase.setHours(0, 0, 0, 0);

    // random number of analyses that day (0..8 or tweak range)
    const analysesCount = randInt(0, 8);

    for (let c = 0; c < analysesCount; c++) {
      // pick a random user
      const user = pick(createdUsers);

      // pick 1..3 entities randomly, with random sentiments/confidence
      const entCount = randInt(1, 3);
      const entities = [];
      for (let e = 0; e < entCount; e++) {
        const name = pick(sampleEntitiesPool);
        const s = pick(sentimentOptions);
        const confidence = randInt(60, 98) / 100; // 0.6 - 0.98
        entities.push({
          entityName: name,
          sentiment: s.label,
          confidence,
        });
      }

      const s = pick(sentimentOptions);
      // random time on that day
      const createdAt = new Date(dayBase.getTime() + randInt(0, 24 * 60 * 60 * 1000 - 1));

      histories.push({
        userId: user._id,
        sentence: `Auto-generated: analysis about ${entities.map((x) => x.entityName).join(", ")}`,
        sentimentResult: { label: s.label, score: parseFloat((Math.random() * (s.high - s.low) + s.low).toFixed(2)) },
        entities,
        inputMethod: pick(inputMethods),
        createdAt,
      });
    }
  }

  // insert bulk: first optionally delete old histories if you want a fresh dataset
  // await History.deleteMany({});
  if (histories.length) {
    console.log(`Inserting ${histories.length} history docs...`);
    await History.insertMany(histories);
    console.log("Inserted history docs:", histories.length);
  } else {
    console.log("No histories generated (set analysesCount range higher).");
  }

  console.log("Done. Users in DB:");
  const allUsers = await User.find({}, "username email role createdAt");
  allUsers.forEach((u) => console.log(u.email, u.role));

  await mongoose.disconnect();
  console.log("Disconnected.");
}

main().catch((err) => {
  console.error("Script error:", err);
  process.exit(1);
});
