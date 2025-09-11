const fs = require("fs");
const path = require("path");
const { SitemapRequest } = require("../api/sitemap/request");

const { getConfig } = require("../lib/config/env");

async function generateSitemap({
  outDir = "./public",
  siteUrl = "",
  sitemapSize = 5000,
}) {
  // 1. Create output directory if not exists
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // 2. Fetch all pages
  const pages = await SitemapRequest.pagesPath();
  const variables = getConfig();
  const contentTypes = [variables.HASP_CONTENT_TYPES];
  const contentData = await Promise.all(
    contentTypes.map(async (contentType) => {
      return await SitemapRequest.contentEntriesPath(contentType);
    })
  );

  const pathsHandler = [...pages, ...contentData.flat()];

  // 3. Convert pages into URL objects
  const urls = pathsHandler.map((p) => {
    const slug = p?.route_url || p?.path || "";
    return {
      loc: `${siteUrl.replace(/\/$/, "")}/${slug.replace(/^\//, "")}`,
      lastmod: new Date().toISOString(),
      changefreq: "daily",
      priority: 0.7,
    };
  });

  // 3.1. Add main domain (home page `/`)
  urls.unshift({
    loc: siteUrl.replace(/\/$/, ""), // no trailing slash
    lastmod: new Date().toISOString(),
    changefreq: "daily",
    priority: 1.0, // usually homepage is most important
  });

  // 4. Chunk into multiple sitemap files
  const chunks = [];
  for (let i = 0; i < urls.length; i += sitemapSize) {
    chunks.push(urls.slice(i, i + sitemapSize));
  }

  const sitemapFiles = [];

  chunks.forEach((chunk, index) => {
    const fileName = `sitemap-${index}.xml`;
    const filePath = path.join(outDir, fileName);

    // Check if sitemap file exists
    if (fs.existsSync(filePath)) {
      console.log(`📄 Sitemap ${fileName} already exists, overwriting...`);
    } else {
      console.log(`🆕 Creating new sitemap file: ${fileName}`);
    }

    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...chunk.map(
        (u) => `
        <url> 
          <loc>${u.loc}</loc>
          <lastmod>${u.lastmod}</lastmod>
          <changefreq>${u.changefreq}</changefreq>
          <priority>${u.priority}</priority>
        </url>
      `
      ),
      "</urlset>",
    ].join("");

    fs.writeFileSync(filePath, xml, "utf8");
    sitemapFiles.push(fileName);
  });

  // 5. Create sitemap index file
  const sitemapIndexPath = path.join(outDir, "sitemap.xml");

  // Check if sitemap index exists
  if (fs.existsSync(sitemapIndexPath)) {
    console.log(`📄 Sitemap index sitemap.xml already exists, overwriting...`);
  } else {
    console.log(`🆕 Creating new sitemap index file: sitemap.xml`);
  }

  const sitemapIndexXml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...sitemapFiles.map(
      (f) => `
      <sitemap>
        <loc>${siteUrl.replace(/\/$/, "")}/${f}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
      </sitemap>
    `
    ),
    "</sitemapindex>",
  ].join("");

  fs.writeFileSync(sitemapIndexPath, sitemapIndexXml, "utf8");

  console.log(
    `✅ Generated ${sitemapFiles.length} sitemap files + sitemap.xml index in ${outDir}`
  );
}

module.exports = { generateSitemap };
