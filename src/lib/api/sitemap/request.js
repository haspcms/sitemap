const fetch = require("node-fetch");
const BaseApi = require("../_base.api");
const Jsona = require("jsona").default;

const dataFormatter = new Jsona();

class SitemapRequest {
  static async getSitemapPages(params = "") {
    const variables = getConfig();
    try {
      const queryParams = params
        ? params + `&filter[sites.id]=${MICROSITE}`
        : `?filter[sites.id]=${MICROSITE}`;

      const res = await BaseApi.get(APIDOMAIN + "/api/pages" + queryParams);
      return res.data;
    } catch (error) {
      console.error("Error fetching sitemap pages:", error);
      return null;
    }
  }

  static async getContents(id, params = "") {
    try {
      const queryParams = params
        ? params + `&filter[sites.id]=${MICROSITE}`
        : `?filter[sites.id]=${MICROSITE}`;

      const res = await BaseApi.get(
        APIDOMAIN + `/api/contents/${id}/entries` + queryParams
      );
      return res.data;
    } catch (error) {
      console.error("Error fetching content entries:", error);
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
    const contentsHandler = await this.getContents(content);
    if (!contentsHandler) return [];

    let allData = dataFormatter.deserialize(contentsHandler);
    let { last_page = 1 } = contentsHandler?.meta || {};
    let current_page = 1;

    while (current_page < last_page) {
      current_page += 1;
      const nextHandler = await this.getContents(
        content,
        `?page[number]=${current_page}`
      );
      if (nextHandler) {
        const nextContents = dataFormatter.deserialize(nextHandler);
        allData = [...allData, ...nextContents];
      }
    }
    return allData;
  }
}

module.exports = { SitemapRequest };
