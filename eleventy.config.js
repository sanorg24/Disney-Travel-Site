export default function (eleventyConfig) {
  // Checkpoint 4.1: only .njk and .md are template formats Eleventy will
  // process. Every existing hand-authored .html/.htm page is excluded via
  // .eleventyignore and handled below as an explicit passthrough copy
  // instead -- this removes any ambiguity about Eleventy reinterpreting
  // production content.
  eleventyConfig.setTemplateFormats(["njk", "md"]);

  // --- Explicit passthrough copy: every existing production asset -------
  eleventyConfig.addPassthroughCopy("photos");
  eleventyConfig.addPassthroughCopy("guides");
  eleventyConfig.addPassthroughCopy("CNAME");
  eleventyConfig.addPassthroughCopy("accessories.html");
  eleventyConfig.addPassthroughCopy("apparel.html");
  eleventyConfig.addPassthroughCopy("blog-6-ways-our-disney-loving-family-actually-saves-money-at-walt.html");
  eleventyConfig.addPassthroughCopy("blog-welcome-to-the-blog.html");
  eleventyConfig.addPassthroughCopy("blog-why-good-shoes-can-make-or-break-your-disney-vacation-for-ev.html");
  eleventyConfig.addPassthroughCopy("blog.html");
  eleventyConfig.addPassthroughCopy("holidays.html");
  eleventyConfig.addPassthroughCopy("index.html");
  eleventyConfig.addPassthroughCopy("sun-travel-essentials.html");
  eleventyConfig.addPassthroughCopy("admin");

  // --- CMS content collections --------------------------------------------
  // Backpacks: published products whose category is specifically "backpacks".
  // Left exactly as-is -- Backpacks is the production-proven reference and
  // is not being refactored onto the shared layout in this rollout.
  eleventyConfig.addCollection("backpackProducts", function (collectionApi) {
    return collectionApi.getFilteredByGlob("content/products/*.md")
      .map((item) => item.data)
      .filter((p) => p.status === "published" && p.category === "backpacks")
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  });

  // All other categories: one generic collection of every published
  // product, any category. The shared category-page layout filters this
  // per-page (by page.slug) using plain Nunjucks equality checks, not
  // selectattr's "equalto" test, which does not work reliably in this
  // Nunjucks setup (discovered and documented earlier in this project).
  eleventyConfig.addCollection("allProducts", function (collectionApi) {
    return collectionApi.getFilteredByGlob("content/products/*.md")
      .map((item) => item.data)
      .filter((p) => p.status === "published")
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  });

  // Plain JS filter, not a Nunjucks selectattr("equalto") chain -- that
  // form was found unreliable in this Nunjucks setup earlier in this
  // project. Real JS string comparison has no such ambiguity.
  eleventyConfig.addFilter("byCategory", function (products, slug) {
    return (products || []).filter((p) => p.category === slug);
  });

  eleventyConfig.addCollection("allLooks", function (collectionApi) {
    return collectionApi.getFilteredByGlob("content/looks/*.md")
      .map((item) => item.data)
      .filter((l) => l.status === "published")
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  });

  eleventyConfig.addFilter("byTheme", function (looks, theme) {
    return (looks || []).filter((l) => l.theme === theme);
  });

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes"
    }
  };
}
