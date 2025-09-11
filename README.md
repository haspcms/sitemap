# HASP Sitemap

## Overview

**HASP Sitemap** is a lightweight sitemap generator designed for HASP CMS–powered projects.  
It helps improve SEO by automatically generating XML sitemaps for pages and content entries.

## Features

- ⚡ **Automatic sitemap generation** – no manual XML editing needed
- 📄 **Supports multiple page/content types**
- 🔗 **Customizable URL patterns**
- 🔍 **SEO-friendly output**, fully compatible with search engines
- 🛠️ **Easy integration with Next.js**

## Installation

```bash
npm install @haspcms/sitemap
```

## Configuration

1. Create a `sitemap.config.js` file in the root of your project.
2. Load environment variables and configure the generator:

```javascript
require("dotenv").config(); // load .env at the very top

const { generateSitemap, setConfig } = require("@haspcms/sitemap");

const envVars = {
  HASP_TENANT_API: process.env.HASP_TENANT_API,
  HASP_RATE_LIMIT_KEY: process.env.HASP_RATE_LIMIT_KEY,
  HASP_MICROSITE_ID: process.env.HASP_MICROSITE_ID,
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

3. After creating the sitemap.config.js file, add a `prebuild` script that runs `node sitemap.config.js` in your `package.json` project file.

## Output

The generator produces standard XML sitemap files inside `./public`:

```
/public/sitemap.xml       # Sitemap index
/public/sitemap-0.xml     # First chunk
/public/sitemap-1.xml     # Additional chunks (if needed)
```

These files are ready to be served and discovered by search engines.

## Example `.env` requirements

```env
HASP_TENANT_API="http://your-tenant-domain-api.com"
HASP_MICROSITE_ID=1234
HASP_RATE_LIMIT_KEY="your-rate-limit-key"
HASP_CONTENT_TYPES="news,boilerplate-articles"
```

## License

This project is licensed under the [MIT License](./LICENSE).

## View Repository

`https://github.com/haspcms/sitemap`

---

💡 **Tip:** For best SEO results, make sure your sitemap URLs are accessible at  
`https://yourdomain.com/sitemap.xml`.
