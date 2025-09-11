const axios = require("axios");
const interceptorSetup = require("./interceptor");

// Apply interceptor to global axios instance
interceptorSetup(axios);

// Create a base axios instance (not yet used in methods, but available)
const basicAxios = axios.create();

class BaseApi {
  static async get(URL) {
    return await axios.get(URL);
  }

  static async post(URL, data) {
    return await axios.post(URL, data).then(
      (response) => response,
      (error) => {
        throw error;
      }
    );
  }

  static async put(URL, data) {
    return await axios.put(URL, data).then(
      (response) => response,
      (error) => {
        throw error;
      }
    );
  }

  static async patch(URL, data) {
    return await axios.patch(URL, data).then(
      (response) => response,
      (error) => {
        throw error;
      }
    );
  }

  static async delete(URL) {
    return await axios.delete(URL).then(
      (response) => response,
      (error) => {
        throw error;
      }
    );
  }
}

module.exports = BaseApi;
