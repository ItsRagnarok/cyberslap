import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";
import { toolDefs, toolByName, SYSTEM_PROMPT } from "./tools.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, "public");
const PORT = process.env.PORT ?? 4141;

if (!process.env.ANTHROPIC_API_KEY) {
  console.error("Lipsește ANTHROPIC_API_KEY. Rulează: export ANTHROPIC_API_KEY=sk-...");
  process.exit(1);
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5";

// Stare simplă, în memorie — un singur utilizator local, fără nevoie de sesiuni.
let conversation = [];

const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript" };

async function serveStatic(req, res) {
  const file = req.url === "/" ? "/index.html" : req.url;
  const full = path.join(PUBLIC_DIR, file);
  if (!full.startsWith(PUBLIC_DIR)) {
    res.writeHead(403).end();
    return;
  }
  try {
    const content = await readFile(full);
    const ext = path.extname(full);
    res.writeHead(200, { "Content-Type": MIME[ext] ?? "text/plain" });
    res.end(content);
  } catch {
    res.writeHead(404).end("not found");
  }
}

function sseSend(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

async function handleChat(userMessage, res) {
  conversation.push({ role: "user", content: userMessage });

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  try {
    for (let step = 0; step < 8; step++) {
      const stream = client.messages.stream({
        model: MODEL,
        max_tokens: 800,
        system: SYSTEM_PROMPT,
        tools: toolDefs,
        messages: conversation,
      });

      stream.on("text", (delta) => sseSend(res, "text", { delta }));

      const final = await stream.finalMessage();
      conversation.push({ role: "assistant", content: final.content });

      const toolUses = final.content.filter((b) => b.type === "tool_use");
      if (toolUses.length === 0) {
        sseSend(res, "done", {});
        res.end();
        return;
      }

      const toolResults = [];
      for (const use of toolUses) {
        sseSend(res, "tool_call", { name: use.name, input: use.input });
        let result;
        try {
          result = await toolByName[use.name].run(use.input);
        } catch (err) {
          result = `Eroare: ${err.message}`;
        }
        sseSend(res, "tool_result", { name: use.name, result: String(result).slice(0, 800) });
        toolResults.push({ type: "tool_result", tool_use_id: use.id, content: String(result) });
      }
      conversation.push({ role: "user", content: toolResults });
    }
    sseSend(res, "error", { message: "Prea mulți pași, opresc aici." });
    res.end();
  } catch (err) {
    sseSend(res, "error", { message: err.message });
    res.end();
  }
}

const server = http.createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/api/chat") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      try {
        const { message } = JSON.parse(body);
        if (!message || typeof message !== "string") {
          res.writeHead(400).end("message required");
          return;
        }
        await handleChat(message, res);
      } catch (err) {
        res.writeHead(500).end(err.message);
      }
    });
    return;
  }

  if (req.method === "POST" && req.url === "/api/reset") {
    conversation = [];
    res.writeHead(200, { "Content-Type": "application/json" }).end("{}");
    return;
  }

  if (req.method === "GET") {
    await serveStatic(req, res);
    return;
  }

  res.writeHead(404).end();
});

server.listen(PORT, () => {
  console.log(`Hello Agent rulează local: http://localhost:${PORT}`);
});
