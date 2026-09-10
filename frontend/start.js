/**
 * start.js — Custom Expo launcher
 *
 * Reads API_BASE_URL from .env and automatically extracts the hostname/IP,
 * then sets REACT_NATIVE_PACKAGER_HOSTNAME so Metro bundler uses the same
 * IP as the backend API. This way, changing the IP in .env is the only
 * thing needed when switching networks.
 *
 * Usage: npm start  (calls `node start.js`)
 */

const { execSync, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

// Parse .env manually (only reads KEY=VALUE lines, ignores comments)
function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  return fs
    .readFileSync(filePath, "utf-8")
    .split("\n")
    .reduce((acc, line) => {
      const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
      if (match) acc[match[1]] = match[2].trim();
      return acc;
    }, {});
}

const env = loadEnv(path.join(__dirname, ".env"));
const apiUrl = env["API_BASE_URL"];

if (!apiUrl) {
  console.error("❌  API_BASE_URL not found in .env");
  process.exit(1);
}

// Extract hostname/IP from the URL  e.g. http://10.214.250.12:8000/api/v1 → 10.214.250.12
let hostname;
try {
  hostname = new URL(apiUrl).hostname;
} catch {
  console.error("❌  Could not parse API_BASE_URL:", apiUrl);
  process.exit(1);
}

console.log(`🌐  Using hostname from .env: ${hostname}`);
console.log(`📦  Starting Expo Metro bundler...\n`);

// Set the packager hostname so Metro uses the correct network interface
const child = spawn(
  "npx",
  ["expo", "start", "--host", "lan"],
  {
    stdio: "inherit",
    shell: true,
    env: {
      ...process.env,
      REACT_NATIVE_PACKAGER_HOSTNAME: hostname,
    },
  }
);

child.on("exit", (code) => process.exit(code ?? 0));
