# HASP Sitemap

## Overview

**HASP Sitemap** is a lightweight sitemap generator designed for HASP CMS–powered projects.  
It helps improve SEO by automatically generating XML sitemaps for pages and content entries.

## Features

- ⚡ **Automatic sitemap generation** – no manual XML editing needed
- 📄 **Supports multiple page/content types**
- 🔗 **Customizable URL patterns**
- 🔍 **SEO-friendly output**, fully compatible with search engines
- 🛠️ **Easy integration with Next.js (or Node.js apps)**

## Installation

```bash
npm install @hasp/sitemap
```

or with Yarn:

```bash
yarn add @hasp/sitemap
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

The generator produces standard XML sitemap files inside `./public`:

```
/public/sitemap.xml       # Sitemap index
/public/sitemap-0.xml     # First chunk
/public/sitemap-1.xml     # Additional chunks (if needed)
```

These files are ready to be served and discovered by search engines.

## Example `.env`

```env
HASP_TENANT_API=https://your-tenant-api.hasp.com
HASP_RATE_LIMIT_KEY=your-rate-limit-key
NEXT_PUBLIC_MICROSITE_ID=123
NEXT_PUBLIC_SITE_URL=https://www.example.com
HASP_CONTENT_TYPES=pages,blog,products
```

## License

This project is licensed under the [MIT License](./LICENSE).

---

💡 **Tip:** For best SEO results, make sure your sitemap URLs are accessible at  
`https://yourdomain.com/sitemap.xml`.
