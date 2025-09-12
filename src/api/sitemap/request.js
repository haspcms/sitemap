const BaseApi = require("../_base.api");
const Jsona = require("jsona").default;

const dataFormatter = new Jsona();
const { getConfig } = require("../../lib/config/env");

class SitemapRequest {
  static async getSitemapPages(params = "") {
    const variables = getConfig();
    try {
      const queryParams = params
        ? params + `&filter[sites.id]=${variables.HASP_MICROSITE_ID || ""}`
        : `?filter[sites.id]=${variables.HASP_MICROSITE_ID || ""}`;

      const res = await BaseApi.get(
        variables.HASP_TENANT_API + "/api/pages" + queryParams
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
        variables.HASP_TENANT_API + `/api/contents/${id}/entries` + queryParams
      );
      return res.data;
    } catch (error) {
      // console.error("Error fetching content entries:", error);
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
        `?page[number]=${current_page}`
      );
      if (nextHandler) {
        const nextPages = dataFormatter.deserialize(nextHandler);
        allData = [...allData, ...nextPages];
      }
    }
    return allData;
  }

  static async contentEntriesPath(content) {
    const variables = getConfig();

    const contents = typeof content === "string" ? content.split(",") : content;
    if (!contents.length) return [];

    let contentsHandler = await Promise.all(
      contents.map(async (item) => {
        const handler = await this.getContents(item);
        return handler ? dataFormatter.deserialize(handler) : [];
      })
    );

    // Flatten results
    let allData = contentsHandler.flat();

    // Handle pagination for each content type
    for (let item of contents) {
      let current_page = 1;
      let handler = await this.getContents(
        item,
        `?page[number]=${current_page}`
      );
      let { last_page = 1 } = handler?.meta || {};

      while (current_page < last_page) {
        current_page++;
        const nextHandler = await this.getContents(
          item,
          `?page[number]=${current_page}`
        );
        if (nextHandler) {
          const nextContents = dataFormatter.deserialize(nextHandler);
          allData = [...allData, ...nextContents];
        }
      }
    }

    return allData;
  }
}

module.exports = { SitemapRequest };
