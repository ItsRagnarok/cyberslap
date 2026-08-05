import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(__dirname, "..", "..");

const IGNORE_DIRS = new Set(["node_modules", ".git", ".next", ".vercel"]);
const TEXT_EXT = new Set([
  ".md", ".ts", ".tsx", ".js", ".mjs", ".jsx", ".json",
  ".css", ".html", ".sql", ".txt", ".yml", ".yaml",
]);

function safeResolve(relPath) {
  const resolved = path.resolve(REPO_ROOT, relPath || ".");
  if (resolved !== REPO_ROOT && !resolved.startsWith(REPO_ROOT + path.sep)) {
    throw new Error("Cale în afara repo-ului — refuz.");
  }
  return resolved;
}

async function walk(absDir, results = []) {
  const entries = await readdir(absDir, { withFileTypes: true });
  for (const e of entries) {
    if (IGNORE_DIRS.has(e.name) || e.name.startsWith(".env")) continue;
    const full = path.join(absDir, e.name);
    if (e.isDirectory()) {
      await walk(full, results);
    } else {
      results.push(path.relative(REPO_ROOT, full));
    }
  }
  return results;
}

export const tools = [
  {
    name: "add",
    description: "Add two numbers together.",
    input_schema: {
      type: "object",
      properties: { a: { type: "number" }, b: { type: "number" } },
      required: ["a", "b"],
    },
    run: ({ a, b }) => a + b,
  },
  {
    name: "get_time",
    description: "Get the current server date and time (UTC).",
    input_schema: { type: "object", properties: {} },
    run: () => new Date().toISOString(),
  },
  {
    name: "list_files",
    description: "List files in the repo, optionally under a subfolder (e.g. 'brain', 'personal-ai/src'). Paths are relative to the repo root.",
    input_schema: {
      type: "object",
      properties: { dir: { type: "string", description: "Subfolder to list, default repo root." } },
    },
    run: async ({ dir = "." }) => {
      const root = safeResolve(dir);
      const files = await walk(root);
      return files.length ? files.sort().slice(0, 300).join("\n") : "(gol)";
    },
  },
  {
    name: "read_file",
    description: "Read a text file from the repo by its path relative to the repo root.",
    input_schema: {
      type: "object",
      properties: { path: { type: "string" } },
      required: ["path"],
    },
    run: async ({ path: relPath }) => {
      const full = safeResolve(relPath);
      const st = await stat(full);
      if (st.isDirectory()) return "E un folder, nu un fișier — folosește list_files.";
      if (st.size > 300_000) return "(fișier prea mare, nu-l citesc integral)";
      const content = await readFile(full, "utf8");
      return content.length > 6000 ? content.slice(0, 6000) + "\n... (trunchiat)" : content;
    },
  },
  {
    name: "search_files",
    description: "Search for a text string across the repo's text files (code, docs, brain notes). Returns matching lines as 'path:line: text'.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string" },
        dir: { type: "string", description: "Optional subfolder to restrict the search to." },
      },
      required: ["query"],
    },
    run: async ({ query, dir = "." }) => {
      const root = safeResolve(dir);
      const files = await walk(root);
      const q = query.toLowerCase();
      const matches = [];
      for (const rel of files) {
        if (!TEXT_EXT.has(path.extname(rel))) continue;
        const full = path.join(REPO_ROOT, rel);
        let content;
        try {
          const st = await stat(full);
          if (st.size > 200_000) continue;
          content = await readFile(full, "utf8");
        } catch {
          continue;
        }
        content.split("\n").forEach((line, i) => {
          if (matches.length < 40 && line.toLowerCase().includes(q)) {
            matches.push(`${rel}:${i + 1}: ${line.trim().slice(0, 200)}`);
          }
        });
        if (matches.length >= 40) break;
      }
      return matches.length ? matches.join("\n") : "Nicio potrivire.";
    },
  },
];

export const toolDefs = tools.map(({ run, ...def }) => def);
export const toolByName = Object.fromEntries(tools.map((t) => [t.name, t]));

export const SYSTEM_PROMPT = `Ești un agent local care ajută la explorarea acestui repo (cod + brain-ul de notițe Obsidian din brain/).
Ai unelte de citire: list_files, read_file, search_files (toate limitate strict la acest repo), plus add și get_time.
Când răspunzi la întrebări despre proiect, decizii sau arhitectură, caută/citește fișierele relevante în loc să presupui — și citează calea fișierului când te bazezi pe el.
Răspunde concis, în română.`;
