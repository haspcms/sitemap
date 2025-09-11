# HASP Sitemap

## Overview

A sitemap generator for HASP projects.

## Features

- Automatically generates XML sitemaps
- Supports multiple page types
- Configurable URL patterns
- SEO-friendly output

## Installation

```bash
npm install
```

## Usage

```bash
node index.js
```

## Configuration

Configure your sitemap settings by adding `sitemap.config.js` :

```javascript
require("dotenv").config(); // load .env at the very top

const { generateSitemap, setConfig } = require("@hasp/sitemap");

const envVars = {
  HASP_TENANT_API: process.env.HASP_TENANT_API,
  HASP_RATE_LIMIT_KEY: process.env.HASP_RATE_LIMIT_KEY,
  HASP_MICROSITE_ID: process.env.NEXT_PUBLIC_MICROSITE_ID,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  HASP_CONTENT_TYPES: process.env.HASP_CONTENT_TYPES,
};

setConfig(envVars);

(async () => {
  try {
    await generateSitemap({
      outDir: "./public",
      siteUrl: envVars.NEXT_PUBLIC_SITE_URL,
      sitemapSize: 5000,
    });
    console.log("✅ Sitemap generated successfully!");
  } catch (err) {
    console.error("❌ Sitemap generation failed:", err);
  }
})();
```

## Output

Generates a standard XML sitemap format compatible with search engines.

## License

MIT
