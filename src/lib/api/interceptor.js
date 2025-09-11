const { getConfig } = require("../config/env");

function setup(axios) {
  axios.interceptors.request.use((config) => {
    const variables = getConfig();
    config.headers["X-Rate-Key"] = variables?.HASP_RATE_LIMIT_KEY || "";
    config.headers["Strict-Transport-Security"] = "max-age=31536000";
    return config;
  });

  axios.interceptors.response.use(
    (response) => {
      return Promise.resolve(response);
    },
    (error) => {
      // const { data, status, statusText } = error.response;
      // Error callback here
      // global popup notification
      return Promise.reject(error?.response);
    }
  );
}

module.exports = setup;
