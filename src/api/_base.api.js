const axios = require("axios");
const interceptorSetup = require("./interceptor");

// Create axios instance
const api = axios.create();

// Apply interceptor to THIS instance
interceptorSetup(api);

class BaseApi {
  static async get(URL, config = {}) {
    return api.get(URL, config);
  }

  static async post(URL, data, config = {}) {
    return api.post(URL, data, config);
  }

  static async put(URL, data, config = {}) {
    return api.put(URL, data, config);
  }

  static async patch(URL, data, config = {}) {
    return api.patch(URL, data, config);
  }

  static async delete(URL, config = {}) {
    return api.delete(URL, config);
  }
}

module.exports = BaseApi;
