import Anthropic from "@anthropic-ai/sdk";
import { toolDefs, toolByName, SYSTEM_PROMPT } from "./tools.mjs";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5";

async function runAgent(task) {
  const messages = [{ role: "user", content: task }];

  for (let step = 0; step < 8; step++) {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 800,
      system: SYSTEM_PROMPT,
      tools: toolDefs,
      messages,
    });

    const toolUses = response.content.filter((b) => b.type === "tool_use");

    if (toolUses.length === 0) {
      const text = response.content
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("\n");
      console.log(`\n[agent] ${text}`);
      return text;
    }

    messages.push({ role: "assistant", content: response.content });

    const toolResults = [];
    for (const use of toolUses) {
      console.log(`[tool] ${use.name}(${JSON.stringify(use.input)})`);
      const result = await toolByName[use.name].run(use.input);
      toolResults.push({ type: "tool_result", tool_use_id: use.id, content: String(result) });
    }

    messages.push({ role: "user", content: toolResults });
  }

  throw new Error("Agent did not finish within the step limit.");
}

const task = process.argv.slice(2).join(" ") || "Ce proiecte sunt în acest repo? Uită-te în brain/.";
console.log(`[task] ${task}`);
await runAgent(task);
