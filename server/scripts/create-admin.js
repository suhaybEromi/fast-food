import process from "node:process";
import readline from "node:readline";

import dotenv from "dotenv";
import mongoose from "mongoose";

import { connectDatabase } from "../database/connect.js";
import Admin from "../models/admin.js";

dotenv.config();

const ALLOWED_ROLES = new Set(["super_admin", "manager", "staff"]);

const clean = value => String(value || "").trim();
const normalizeEmail = value => clean(value).toLowerCase();

const ask = (question, fallback = "") =>
  new Promise(resolve => {
    const prompt = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    prompt.question(question, answer => {
      prompt.close();
      resolve(clean(answer) || fallback);
    });
  });

const askHidden = question =>
  new Promise((resolve, reject) => {
    if (!process.stdin.isTTY || !process.stdout.isTTY) {
      reject(
        new Error(
          "ADMIN_PASSWORD is required when the script is not running in an interactive terminal.",
        ),
      );
      return;
    }

    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdout.write(question);

    let password = "";

    const finish = () => {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdin.removeListener("keypress", onKeypress);
      process.stdout.write("\n");
      resolve(password);
    };

    const onKeypress = (character, key = {}) => {
      if (key.ctrl && key.name === "c") {
        process.stdin.setRawMode(false);
        process.stdout.write("\n");
        process.exit(130);
      }

      if (key.name === "return" || key.name === "enter") {
        finish();
        return;
      }

      if (key.name === "backspace") {
        if (password.length > 0) {
          password = password.slice(0, -1);
          process.stdout.write("\b \b");
        }
        return;
      }

      if (character && !key.ctrl && !key.meta) {
        password += character;
        process.stdout.write("*");
      }
    };

    process.stdin.on("keypress", onKeypress);
  });

const validateInput = ({ name, email, password, role }) => {
  if (!name) throw new Error("Admin name is required.");
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("A valid email is required.");
  if (password.length < 12) {
    throw new Error("Admin password must contain at least 12 characters.");
  }
  if (!ALLOWED_ROLES.has(role)) {
    throw new Error(`Role must be one of: ${[...ALLOWED_ROLES].join(", ")}.`);
  }
};

const run = async () => {
  const mongoUrl = clean(process.env.MONGO_URL);
  if (!mongoUrl) throw new Error("MONGO_URL must be configured in server/.env.");

  const interactive = process.stdin.isTTY && process.stdout.isTTY;
  const name =
    clean(process.env.ADMIN_NAME) ||
    (interactive ? await ask("Admin name: ") : "");
  const email =
    normalizeEmail(process.env.ADMIN_EMAIL) ||
    (interactive ? normalizeEmail(await ask("Admin email: ")) : "");
  const password =
    clean(process.env.ADMIN_PASSWORD) ||
    (interactive ? await askHidden("Admin password (12+ characters): ") : "");
  const role =
    clean(process.env.ADMIN_ROLE).toLowerCase() ||
    (interactive
      ? clean(await ask("Role [super_admin]: ", "super_admin")).toLowerCase()
      : "super_admin");

  validateInput({ name, email, password, role });
  await connectDatabase(mongoUrl);

  const existingAdmin = await Admin.findOne({ email }).lean();
  if (existingAdmin) {
    throw new Error(`An admin with email ${email} already exists.`);
  }

  const admin = await Admin.create({ name, email, password, role });
  process.stdout.write(
    `Admin created successfully: ${admin.email} (${admin.role})\n`,
  );
};

try {
  await run();
} catch (error) {
  process.stderr.write(`Could not create admin: ${error.message}\n`);
  process.exitCode = 1;
} finally {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}
