import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("public/library");
const output = path.join(root, "catalog.json");
const allowed = new Set([".md", ".yaml", ".yml", ".txt"]);

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(target);
    const extension = path.extname(entry.name).toLowerCase();
    if (!entry.isFile() || !allowed.has(extension)) return [];
    const relative = path.relative(root, target).split(path.sep).join("/");
    if (relative === "README.md" || relative === "SKILL.md") return [];
    return [{ path: relative, content: await readFile(target, "utf8") }];
  }));
  return files.flat();
}

const documents = (await walk(root)).sort((a, b) => a.path.localeCompare(b.path, "zh-CN"));
await writeFile(output, JSON.stringify({ source: "cross-border-sop-fieldguide", documents }));
console.log(`Prepared ${documents.length} source documents.`);
