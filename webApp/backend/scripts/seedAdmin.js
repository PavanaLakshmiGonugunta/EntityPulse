// scripts/seedAdmin.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) throw new Error("Set MONGO_URI in .env");

await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Minimal user model (match your real schema)
const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model("User", userSchema, "users");

const email = process.argv[2] || "admin@example.com";
const username = process.argv[3] || "admin";
const password = process.argv[4] || "AdminPass123!";

const hashed = await bcrypt.hash(password, 10);

const existing = await User.findOne({ email });
if (existing) {
    console.log("User exists - updating role to admin");
    await User.updateOne({ email }, { $set: { role: "admin", password: hashed } });
    process.exit(0);
}

await User.create({
    username,
    email,
    password: hashed,
    role: "admin",
    createdAt: new Date(),
});

console.log("Admin created:", email);
await mongoose.disconnect();
process.exit(0);
