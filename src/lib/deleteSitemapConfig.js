// scripts/remove.js
const fs = require("fs");
const path = require("path");

const configFile = path.join("./sitemap.config.js");

if (fs.existsSync(configFile)) {
  const content = fs.readFileSync(configFile, "utf8");

  // Only remove if auto-generated
  if (content.includes("@haspcms/sitemap")) {
    fs.unlinkSync(configFile);
    console.log("🗑️ Removed auto-generated sitemap.config.js");
  } else {
    console.log("⚠️ sitemap.config.js looks user-modified, not removing");
  }
} else {
  console.log("ℹ️ No sitemap.config.js found, nothing to remove");
}
