const BaseApi = require("../_base.api");
const Jsona = require("jsona").default;

const dataFormatter = new Jsona();
const { getConfig } = require("../../lib/config/env");

const MAX_CONCURRENCY = 10; // adjust for speed vs. API load

class SitemapRequest {
  static async getSitemapPages(params = "") {
    const variables = getConfig();
    try {
      const queryParams = params
        ? params + `&filter[sites.id]=${variables.HASP_MICROSITE_ID || ""}`
        : `?filter[sites.id]=${variables.HASP_MICROSITE_ID || ""}`;

      const res = await BaseApi.get(
        variables.HASP_TENANT_API + "/api/pages" + queryParams,
      );
      return res.data;
    } catch (error) {
      console.error("Error fetching sitemap pages:", error);
      return null;
    }
  }

  static async getContents(id, params = "") {
    const variables = getConfig();
    try {
      const queryParams = params
        ? params + `&filter[sites.id]=${variables.HASP_MICROSITE_ID || ""}`
        : `?filter[sites.id]=${variables.HASP_MICROSITE_ID || ""}`;

      const res = await BaseApi.get(
        variables.HASP_TENANT_API + `/api/contents/${id}/entries` + queryParams,
      );
      return res.data;
    } catch {
      return null;
    }
  }

  static async pagesPath() {
    const pagesHandler = await this.getSitemapPages();
    if (!pagesHandler) return [];

    let allData = dataFormatter.deserialize(pagesHandler);
    let { last_page = 1 } = pagesHandler?.meta || {};
    let current_page = 1;

    while (current_page < last_page) {
      current_page += 1;
      const nextHandler = await this.getSitemapPages(
        `?page[number]=${current_page}`,
      );
      if (nextHandler) {
        const nextPages = dataFormatter.deserialize(nextHandler);
        allData = [...allData, ...nextPages];
      }
    }
    return allData;
  }

  /**
   * Fetch content entries for given content types.
   * @param {string|string[]} content - content type(s)
   * @param {number} concurrency - number of pages to fetch in parallel
   * @param {function} onProgress - callback (count) => {} for reporting per-page progress
   */
  static async contentEntriesPath(
    content,
    concurrency = MAX_CONCURRENCY,
    onProgress = null,
  ) {
    const variables = getConfig();
    const contents = typeof content === "string" ? content.split(",") : content;
    if (!contents.length) return [];

    let allData = [];

    for (let item of contents) {
      console.log(`➡️ Fetching content type: ${item}`);

      // Fetch first page
      const firstHandler = await this.getContents(item, `?page[number]=1`);
      if (!firstHandler) {
        console.warn(`⚠️ No data returned for ${item}`);
        continue;
      }

      const { last_page = 1, total = "?" } = firstHandler?.meta || {};
      let allEntries = dataFormatter.deserialize(firstHandler);
      if (onProgress) onProgress(allEntries.length);

      console.log(
        `✅ ${item}: page 1/${last_page} → ${allEntries.length} entries`,
      );

      // Batch fetch remaining pages
      let currentPage = 2;
      let done = false;

      const runBatch = async (pages) => {
        const promises = pages.map((page) =>
          this.getContents(item, `?page[number]=${page}`),
        );

        const settled = await Promise.allSettled(promises);

        for (let i = 0; i < settled.length; i++) {
          const result = settled[i];
          const pageNum = pages[i];

          if (result.status === "fulfilled" && result.value) {
            const deserialized = dataFormatter.deserialize(result.value);
            allEntries.push(...deserialized);

            if (onProgress) onProgress(deserialized.length);

            console.log(
              `✅ ${item}: page ${pageNum}/${last_page} → ${deserialized.length} entries`,
            );
          } else {
            console.error(`❌ ${item}: failed page ${pageNum}`);
            done = true;
            break;
          }
        }
      };

      while (!done && currentPage <= last_page) {
        const batch = Array.from(
          { length: concurrency },
          (_, i) => currentPage + i,
        ).filter((p) => p <= last_page);

        await runBatch(batch);
        currentPage += concurrency;
      }

      console.log(`🎉 Finished ${item} → ${allEntries.length} entries`);
      allData.push(...allEntries);
    }

    return allData;
  }
}

module.exports = { SitemapRequest };
