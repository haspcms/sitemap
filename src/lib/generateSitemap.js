const fs = require("fs");
const path = require("path");
const { SitemapRequest } = require("./api/sitemap/request");

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

  // 3. Convert pages into URL objects
  const urls = pages.map((p) => {
    const slug = p?.slug || p?.path || "";
    return {
      loc: `${siteUrl.replace(/\/$/, "")}/${slug.replace(/^\//, "")}`,
      lastmod: new Date().toISOString(),
      changefreq: "daily",
      priority: 0.7,
    };
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

  fs.writeFileSync(path.join(outDir, "sitemap.xml"), sitemapIndexXml, "utf8");

  console.log(
    `✅ Generated ${sitemapFiles.length} sitemap files + sitemap.xml index in ${outDir}`
  );
}

module.exports = { generateSitemap };
