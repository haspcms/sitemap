const NodeCache = require("node-cache");

const cache = new NodeCache();

function setConfig(config) {
  cache.set("config", config);
}

function getConfig() {
  return cache.get("config") || {};
}

module.exports = {
  setConfig,
  getConfig,
};
