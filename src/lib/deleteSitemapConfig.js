const fs = require("fs");
const path = require("path");

const configFile = path.join("../../../sitemap.config.js");

if (fs.existsSync(configFile)) {
  fs.unlinkSync(configFile);
} else {
  console.log("ℹ️ No sitemap.config.js found, nothing to remove");
}
