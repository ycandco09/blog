import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const MAX_CONTENT_LENGTH = 2000;

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

function buildSearchIndex() {
  const blogDir = path.join(root, "content", "blog");
  const entries = [];
  let idCounter = 1;

  const files = getMdFiles(blogDir);
  for (const filePath of files) {
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);

    if (data.draft) continue;
    if (!data.title || !data.category) continue;

    entries.push({
      id: idCounter++,
      title: data.title,
      slug: data.slug || path.basename(filePath, ".md"),
      category: data.category,
      tags: data.tags || [],
      type: data.type || "note",
      excerpt: (data.description || "").slice(0, 200),
      content: content.replace(/\s+/g, " ").trim().slice(0, MAX_CONTENT_LENGTH),
    });
  }

  const indexPath = path.join(root, "public", "search-index.json");
  fs.mkdirSync(path.dirname(indexPath), { recursive: true });
  fs.writeFileSync(indexPath, JSON.stringify(entries));

  console.log(`[search] 搜索索引已生成: ${entries.length} 条记录`);
}

console.log("[prebuild] 开始生成搜索索引...");
buildSearchIndex();
console.log("[prebuild] 搜索索引生成完成");
