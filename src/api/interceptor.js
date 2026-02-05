const AuthRequest = require("../api/auth/request"); // adjust path

const { getConfig } = require("../lib/config/env");

function setup(axiosInstance) {
  axiosInstance.interceptors.request.use(async (config) => {
    const variables = await getConfig();

    // Get token from AuthRequest
    const token = await AuthRequest.generateToken();

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers["X-Rate-Key"] = variables?.HASP_RATE_LIMIT_KEY || "";
    config.headers["Strict-Transport-Security"] = "max-age=31536000";

    return config;
  });

  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error?.response || error),
  );
}

module.exports = setup;
