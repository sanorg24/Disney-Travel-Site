export default {
  layout: "blog-post-layout.njk",
  tags: ["blogPosts"],
  eleventyComputed: {
    permalink: (data) => {
      return data.status === "published"
        ? `blog-${data.page.fileSlug}.html`
        : false;
    }
  }
};
