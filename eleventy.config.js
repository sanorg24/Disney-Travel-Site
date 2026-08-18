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
  eleventyConfig.addPassthroughCopy("index.html");
  eleventyConfig.addPassthroughCopy("admin");

  // --- CMS content collections --------------------------------------------
  // Backpacks: published products whose category is specifically "backpacks".
  // Left exactly as-is -- Backpacks is the production-proven reference and
  // is not being refactored onto the shared layout in this rollout.
  // --- Taxonomy validation ---------------------------------------------
  // Runs on every build. Hard-fails (stops the build) if any published
  // Product references a Category or Subgroup slug that doesn't exist in
  // the taxonomy, or a Subgroup whose parent Category doesn't match the
  // Product's own Category -- these are genuine data errors. Inactive
  // (but existing) taxonomy references only produce a visible warning
  // and do not fail the build -- retiring a Category/Subgroup must never
  // break a deployment or hide already-published products.
  eleventyConfig.addCollection("taxonomyValidation", function (collectionApi) {
    const categories = collectionApi.getFilteredByGlob("content/taxonomy/categories/*.md").map((i) => i.data);
    const subgroups = collectionApi.getFilteredByGlob("content/taxonomy/subgroups/*.md").map((i) => i.data);
    const products = collectionApi.getFilteredByGlob("content/products/*.md")
      .map((i) => i.data)
      .filter((p) => p.status === "published");

    const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));
    const subgroupBySlug = new Map(subgroups.map((s) => [s.slug, s]));

    const errors = [];
    const warnings = [];

    for (const p of products) {
      const cat = categoryBySlug.get(p.category);
      if (!cat) {
        errors.push(`Product "${p.name}" references unknown Category "${p.category}".`);
      } else if (cat.active === false) {
        warnings.push(`Product "${p.name}" references inactive Category "${p.category}" (${cat.label}).`);
      }

      if (p.subgroup) {
        const sg = subgroupBySlug.get(p.subgroup);
        if (!sg) {
          errors.push(`Product "${p.name}" references unknown Subgroup "${p.subgroup}".`);
        } else {
          if (sg.category !== p.category) {
            errors.push(`Product "${p.name}" has Subgroup "${p.subgroup}" whose parent Category ` +
              `"${sg.category}" does not match the Product's own Category "${p.category}".`);
          }
          if (sg.active === false) {
            warnings.push(`Product "${p.name}" references inactive Subgroup "${p.subgroup}" (${sg.label}).`);
          }
        }
      }
    }

    if (warnings.length) {
      console.warn("\n\u26A0\uFE0F  Taxonomy warnings (build continues):");
      warnings.forEach((w) => console.warn("  - " + w));
    }
    if (errors.length) {
      throw new Error(
        "Taxonomy validation failed -- build stopped:\n" +
        errors.map((e) => "  - " + e).join("\n")
      );
    }
    return { errors, warnings, checkedProducts: products.length };
  });

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
