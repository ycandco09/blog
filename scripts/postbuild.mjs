import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const githubPages = process.env.GITHUB_PAGES === "true";
const repoName = process.env.GITHUB_REPO_NAME || "blog";
const BASE_URL = githubPages
  ? `https://${process.env.GITHUB_USER || "username"}.github.io/${repoName}`
  : process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.com";

function getMdFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) walk(fullPath);
      else if (entry.name.endsWith(".md")) results.push(fullPath);
    }
  }
  walk(dir);
  return results;
}

function countMdFiles(dir) {
  return getMdFiles(dir).length;
}

function generateSitemap() {
  const blogDir = path.join(root, "content", "blog");
  const materialsDir = path.join(root, "content", "materials");

  const urls = [];

  urls.push({ url: BASE_URL, priority: "1.0", changefreq: "weekly" });
  urls.push({ url: `${BASE_URL}/blog`, priority: "0.9", changefreq: "weekly" });
  urls.push({ url: `${BASE_URL}/materials`, priority: "0.7", changefreq: "monthly" });
  urls.push({ url: `${BASE_URL}/writeups`, priority: "0.7", changefreq: "monthly" });
  urls.push({ url: `${BASE_URL}/resume`, priority: "0.8", changefreq: "monthly" });
  urls.push({ url: `${BASE_URL}/about`, priority: "0.5", changefreq: "monthly" });
  urls.push({ url: `${BASE_URL}/search`, priority: "0.4", changefreq: "monthly" });

  const categories = new Set();

  const blogFiles = getMdFiles(blogDir);
  for (const filePath of blogFiles) {
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(raw);
    if (data.draft) continue;

    const slug = data.slug || path.basename(filePath, ".md");
    const category = data.category || path.basename(path.dirname(filePath));
    categories.add(category);

    urls.push({
      url: `${BASE_URL}/blog/${category}/${slug}`,
      priority: "0.8",
      changefreq: "monthly",
      lastmod: data.updated || data.date || "",
    });
  }

  for (const cat of categories) {
    urls.push({ url: `${BASE_URL}/blog/${cat}`, priority: "0.6", changefreq: "weekly" });
  }

  const materialFiles = getMdFiles(materialsDir);
  const matCats = new Set();
  for (const filePath of materialFiles) {
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(raw);
    if (data.draft) continue;
    if (data.category) {
      matCats.add(data.category);
      const slug = data.slug || path.basename(filePath, ".md");
      urls.push({ url: `${BASE_URL}/materials/${data.category}/${slug}`, priority: "0.5", changefreq: "monthly" });
    }
  }
  for (const cat of matCats) {
    urls.push({ url: `${BASE_URL}/materials/${cat}`, priority: "0.5", changefreq: "monthly" });
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(
      (u) =>
        `  <url>\n    <loc>${u.url}</loc>\n    ${
          u.lastmod ? `<lastmod>${u.lastmod}</lastmod>\n    ` : ""
        }<changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
    ),
    "</urlset>",
    "",
  ].join("\n");

  const outDir = path.join(root, "out");
  fs.writeFileSync(path.join(outDir, "sitemap.xml"), xml);
  console.log(`  Sitemap: ${urls.length} URLs`);
}

function main() {
  console.log("\n📊 Build Summary\n" + "=".repeat(40));

  const blogCount = countMdFiles(path.join(root, "content", "blog"));
  const materialCount = countMdFiles(path.join(root, "content", "materials"));
  const writeupCount = countMdFiles(path.join(root, "content", "writeups"));

  console.log(`  Posts:       ${blogCount}`);
  console.log(`  Materials:   ${materialCount}`);
  console.log(`  Writeups:    ${writeupCount}`);

  const searchIndexPath = path.join(root, "out", "search-index.json");
  if (fs.existsSync(searchIndexPath)) {
    const stat = fs.statSync(searchIndexPath);
    console.log(`  Search Index: ${(stat.size / 1024).toFixed(1)}KB`);
  } else {
    console.warn("  ⚠ Search Index: 未生成");
  }

  generateSitemap();

  const outDir = path.join(root, "out");
  if (fs.existsSync(outDir)) {
    const items = fs.readdirSync(outDir);
    console.log(`  Output files: ${items.length} items`);
  }

  console.log("\n✅ Build completed successfully\n");
}

main();
