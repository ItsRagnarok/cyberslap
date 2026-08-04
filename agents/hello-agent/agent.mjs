import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5";

// Tools the agent is allowed to use. Each one is a plain function —
// the agent decides on its own when (and whether) to call them.
const tools = [
  {
    name: "add",
    description: "Add two numbers together.",
    input_schema: {
      type: "object",
      properties: {
        a: { type: "number" },
        b: { type: "number" },
      },
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
];

const toolDefs = tools.map(({ run, ...def }) => def);
const toolByName = Object.fromEntries(tools.map((t) => [t.name, t]));

async function runAgent(task) {
  const messages = [{ role: "user", content: task }];

  for (let step = 0; step < 8; step++) {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 500,
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

    const toolResults = toolUses.map((use) => {
      console.log(`[tool] ${use.name}(${JSON.stringify(use.input)})`);
      const result = toolByName[use.name].run(use.input);
      return { type: "tool_result", tool_use_id: use.id, content: String(result) };
    });

    messages.push({ role: "user", content: toolResults });
  }

  throw new Error("Agent did not finish within the step limit.");
}

const task = process.argv.slice(2).join(" ") || "Cât e 12 + 30, și cât e ora acum (UTC)?";
console.log(`[task] ${task}`);
await runAgent(task);
