import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5";

export type ChatMessage = { role: "user" | "assistant"; content: string };

const COACH_PERSONA = `You are the user's personal AI analyst and coach, running as part of a private system only they use.
Your job across every conversation:
- Ask specific, concrete follow-up questions about what they actually did today (work, habits, money, health, relationships) — don't accept vague answers, push gently for specifics.
- Notice patterns over time (procrastination, follow-through, spending, energy) and name them directly but respectfully.
- Give practical next actions, not generic motivation.
- Be honest and calibrated: you are not a fortune teller. When asked about wealth, success, or the future, reason from observable patterns (consistency, skills, decisions, market context) and always frame conclusions as estimates with explicit uncertainty and the specific levers that would change the outcome — never as guarantees or deterministic prophecy.
- Keep replies concise (2-6 sentences) and conversational, like a sharp friend who is also a strategist. No filler, no excessive praise.`;

export async function chatReply(history: ChatMessage[], profileNarrative: string) {
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 500,
    system: `${COACH_PERSONA}\n\nWhat you know about the user so far:\n${profileNarrative || "(nothing yet — this is one of the first conversations, focus on learning the basics: what they do, what they want, what's in their way.)"}`,
    messages: history.map((m) => ({ role: m.role, content: m.content })),
  });
  return msg.content.filter((b) => b.type === "text").map((b: any) => b.text).join("\n").trim();
}

function extractJson(text: string) {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  return JSON.parse(cleaned.slice(start, end + 1));
}

export async function generateDailySummary(opts: {
  entries: ChatMessage[];
  previousNarrative: string;
}) {
  const transcript = opts.entries.map((e) => `${e.role.toUpperCase()}: ${e.content}`).join("\n");
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 900,
    system: `${COACH_PERSONA}\n\nYou will read today's check-in conversation and update the running profile of the user. Respond with ONLY a JSON object, no prose, matching exactly:
{
  "summary": "2-4 sentence factual summary of what they did today",
  "mood": "one or two words describing their apparent state",
  "key_actions": ["short action item strings, concrete things they did or committed to"],
  "learned": "1-3 sentences on what this conversation revealed about who they are (new, not repeated from before)",
  "updated_narrative": "the FULL updated running narrative about the user — rewrite the previous narrative below, folding in anything new learned today, staying under 250 words, third person, factual and specific"
}

Previous narrative:
${opts.previousNarrative || "(none yet)"}`,
    messages: [{ role: "user", content: `Today's conversation:\n${transcript || "(no messages today)"}` }],
  });
  const text = msg.content.filter((b) => b.type === "text").map((b: any) => b.text).join("\n");
  return extractJson(text) as {
    summary: string;
    mood: string;
    key_actions: string[];
    learned: string;
    updated_narrative: string;
  };
}

export async function generatePrediction(opts: {
  narrative: string;
  recentSummaries: string[];
  headlines: string[];
  horizon: string;
}) {
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 900,
    system: `${COACH_PERSONA}\n\nProduce a trajectory analysis for the given horizon. Respond with ONLY a JSON object:
{
  "narrative": "realistic, specific analysis of where they're headed on this horizon if current patterns continue, including named uncertainty and 2-3 concrete forks in the road that would change the outcome — 150-300 words",
  "confidence": "low | medium | high — your confidence in this read given how much data you actually have",
  "focus_areas": ["2-4 short, concrete things to work on to improve the trajectory"]
}`,
    messages: [
      {
        role: "user",
        content: `Horizon: ${opts.horizon}\n\nWhat is known about the user:\n${opts.narrative || "(very little yet)"}\n\nRecent daily summaries:\n${opts.recentSummaries.join("\n") || "(none yet)"}\n\nCurrent world/news context (for situational awareness only, weight lightly unless directly relevant):\n${opts.headlines.join("\n") || "(unavailable)"}`,
      },
    ],
  });
  const text = msg.content.filter((b) => b.type === "text").map((b: any) => b.text).join("\n");
  return extractJson(text) as { narrative: string; confidence: string; focus_areas: string[] };
}
