const axios = require("axios");
const { getConfig } = require("../../lib/config/env");

class AuthRequest {
  static _cachedToken = null;
  static _tokenExpiry = 0; // timestamp in ms

  static async generateToken() {
    const variables = await getConfig();

    // Skip token generation if strict API is disabled
    if (variables?.HASP_TENANT_STRICT_API_ENABLED === "false") {
      return null;
    }

    const now = Date.now();

    // Return cached token if still valid
    if (this._cachedToken && now < this._tokenExpiry) {
      return this._cachedToken;
    }

    try {
      const res = await axios.post(
        `${variables.HASP_TENANT_API}/api/auth/token`,
        {
          api_key: variables.HASP_TENANT_API_KEY,
          secret_key: variables.HASP_TENANT_SECRET_KEY.replace(/[\\]+/g, ""),
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        },
      );

      const tokenData = res.data;
      const accessToken = tokenData?.access_token || tokenData?.token;

      if (accessToken) {
        // cache token for slightly less than actual expiry (default 55 min)
        const expiresIn = tokenData?.expires_in || 3600; // seconds
        this._cachedToken = accessToken;
        this._tokenExpiry = now + (expiresIn - 60) * 1000; // refresh 1 min before expiry
        return accessToken;
      }

      return null;
    } catch (err) {
      console.error(
        "Token fetch error:",
        err.response?.data || err.message || err,
      );
      return null;
    }
  }
}

module.exports = AuthRequest;
