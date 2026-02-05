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
  console.log("📄 Fetching static pages...");
  const pages = await SitemapRequest.pagesPath();

  console.log("📄 Fetching content data...");
  const variables = getConfig();
  const contentTypes = [variables.HASP_CONTENT_TYPES];

  let generatedCount = 0;
  let totalCountEstimate = 0;
  const startTime = Date.now();

  // log progress every second
  const interval = setInterval(() => {
    const elapsed = (Date.now() - startTime) / 1000;
    const rate = generatedCount / (elapsed || 1);
    const remaining = totalCountEstimate
      ? Math.max(totalCountEstimate - generatedCount, 0)
      : 0;
    const eta = rate > 0 ? (remaining / rate).toFixed(1) : "∞";
    console.log(
      `⏱️ Progress: ${generatedCount}/${
        totalCountEstimate || "?"
      } URLs | Elapsed: ${elapsed.toFixed(1)}s | ETA: ${eta}s`,
    );
  }, 1000);

  // Wrap the original call to log pages as they are fetched
  async function fetchContentEntries(contentType) {
    return await SitemapRequest.contentEntriesPath(
      contentType,
      10,
      (count) => {
        generatedCount += count;
      }, // ✅ live progress
    );
  }

  const contentData = await Promise.all(
    contentTypes.map(async (contentType) => {
      return await fetchContentEntries(contentType);
    }),
  );

  clearInterval(interval);

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
    loc: siteUrl.replace(/\/$/, ""),
    lastmod: new Date().toISOString(),
    changefreq: "daily",
    priority: 1.0,
  });

  console.log(`✅ Finished fetching. Total URLs: ${urls.length}`);

  // 4. Chunk into multiple sitemap files
  const chunks = [];
  for (let i = 0; i < urls.length; i += sitemapSize) {
    chunks.push(urls.slice(i, i + sitemapSize));
  }

  const sitemapFiles = [];

  chunks.forEach((chunk, index) => {
    const fileName = `sitemap-${index}.xml`;
    const filePath = path.join(outDir, fileName);

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
      `,
      ),
      "</urlset>",
    ].join("");

    fs.writeFileSync(filePath, xml, "utf8");
    sitemapFiles.push(fileName);
  });

  // 5. Create sitemap index file
  const sitemapIndexPath = path.join(outDir, "sitemap.xml");

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
    `,
    ),
    "</sitemapindex>",
  ].join("");

  fs.writeFileSync(sitemapIndexPath, sitemapIndexXml, "utf8");

  console.log(
    `✅ Generated ${sitemapFiles.length} sitemap files + sitemap.xml index in ${outDir}`,
  );
}

module.exports = { generateSitemap };
