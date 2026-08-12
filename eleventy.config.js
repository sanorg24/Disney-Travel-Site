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
  eleventyConfig.addPassthroughCopy("accessories-ears-headbands.html");
  eleventyConfig.addPassthroughCopy("accessories-footwear.html");
  eleventyConfig.addPassthroughCopy("accessories-hats.html");
  eleventyConfig.addPassthroughCopy("accessories-loungefly.html");
  eleventyConfig.addPassthroughCopy("accessories-pandora.html");
  eleventyConfig.addPassthroughCopy("accessories.html");
  eleventyConfig.addPassthroughCopy("apparel-family-tees.htm");
  eleventyConfig.addPassthroughCopy("apparel-kids.html");
  eleventyConfig.addPassthroughCopy("apparel-mens.html");
  eleventyConfig.addPassthroughCopy("apparel-womens.html");
  eleventyConfig.addPassthroughCopy("apparel.html");
  eleventyConfig.addPassthroughCopy("blog-6-ways-our-disney-loving-family-actually-saves-money-at-walt.html");
  eleventyConfig.addPassthroughCopy("blog-welcome-to-the-blog.html");
  eleventyConfig.addPassthroughCopy("blog-why-good-shoes-can-make-or-break-your-disney-vacation-for-ev.html");
  eleventyConfig.addPassthroughCopy("blog.html");
  eleventyConfig.addPassthroughCopy("holidays-family-halloween.html");
  eleventyConfig.addPassthroughCopy("holidays.html");
  eleventyConfig.addPassthroughCopy("index.html");
  eleventyConfig.addPassthroughCopy("outfits.html");
  eleventyConfig.addPassthroughCopy("sun-travel-cooling-fans.html");
  eleventyConfig.addPassthroughCopy("sun-travel-essentials.html");
  eleventyConfig.addPassthroughCopy("sun-travel-hair-care.html");
  eleventyConfig.addPassthroughCopy("sun-travel-personal-care.html");
  eleventyConfig.addPassthroughCopy("sun-travel-sunscreen.html");
eleventyConfig.addPassthroughCopy("admin");
  // --- Checkpoint 4.2: admin/ intentionally NOT passthrough-copied here.
  // The Sveltia admin source files remain present in the repo on this
  // branch for development, but must not appear in the production
  // artifact until Checkpoint 4.4, after real authentication and the
  // safe save/PR workflow are proven. See CLAUDE.md / ARCHITECTURE.md.

  // --- CMS content collections (Backpacks pilot only) --------------------
  eleventyConfig.addCollection("backpackProducts", function (collectionApi) {
    return collectionApi.getFilteredByGlob("content/products/*.md")
      .map((item) => item.data)
      .filter((p) => p.status === "published")
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  });

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes"
    }
  };
}
