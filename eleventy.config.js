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

  // --- Blog content collection -------------------------------------------
  // Each post lives as content/blog/<slug>.md; content/blog/blog.json (an
  // Eleventy directory data file) applies the shared layout, permalink
  // pattern, and "blogPosts" tag to every post automatically, so individual
  // post front matter only needs the content fields (title/date/tag/
  // excerpt/hero image/body) -- no per-post template or manual Blog Hub
  // card editing required going forward.
  eleventyConfig.addCollection("blogPosts", function (collectionApi) {
    return collectionApi.getFilteredByGlob("content/blog/*.md")
      .filter((item) => item.data.status === "published")
      .sort((a, b) => {
        const dateA = new Date(a.data.date).getTime();
        const dateB = new Date(b.data.date).getTime();
        if (dateB !== dateA) return dateB - dateA; // newest first
        return a.data.title.localeCompare(b.data.title); // deterministic tiebreak for same-date posts
      });
  });

  // Single structured-date formatter, used identically by both the Blog
  // Hub cards and each article's own page -- one source of truth, no
  // duplicated hand-typed date strings.
  eleventyConfig.addFilter("isoDate", function (d) {
    if (!d) return "";
    const date = (d instanceof Date) ? d : new Date(d);
    if (isNaN(date.getTime())) return String(d);
    return date.toISOString().slice(0, 10);
  });

  // Maps a Blog post's stored category slug to the human-readable label
  // already used by the Blog Hub's filter buttons.
  // Eleventy's collection-item .url always includes a leading "/" (URL
  // path from domain root). Every other link in this codebase is a bare
  // relative path (e.g. href="apparel.html"), so this strips that leading
  // slash to match the existing convention rather than introduce a new one.
  eleventyConfig.addFilter("stripLeadingSlash", function (url) {
    return (url || "").replace(/^\//, "");
  });

  eleventyConfig.addFilter("tagLabel", function (slug) {
    const labels = {
      "travel-tips": "Travel Tips",
      "disney-news": "Disney News & Updates",
      "outfit-inspiration": "Outfits & Packing",
      "family-accessibility": "Family & Accessibility"
    };
    return labels[slug] || slug;
  });

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes"
    }
  };
}
