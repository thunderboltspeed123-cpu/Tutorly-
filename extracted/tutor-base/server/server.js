import express from "express";
import rateLimit from "express-rate-limit";
import Anthropic from "@anthropic-ai/sdk";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildSystemPrompt, SUBJECTS, AGE_BANDS } from "./tutor-prompt.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({ limit: "20kb" }));

// Reads ANTHROPIC_API_KEY from the environment. The key never goes in the app or the browser.
const client = new Anthropic();
const MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-5-5";

// CORS: lets your Google-built app call this server. Set ALLOWED_ORIGIN to your app's address.
app.use((req, res, next) => {
  const origin = process.env.ALLOWED_ORIGIN || "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// 20 messages per minute per visitor, so one child (or bot) cannot run up your bill.
app.use("/api/", rateLimit({ windowMs: 60_000, limit: 20, standardHeaders: true, legacyHeaders: false }));

app.use(express.static(path.join(__dirname, "..", "public")));

function cleanMessages(input) {
  if (!Array.isArray(input)) return null;
  const msgs = input
    .slice(-12)
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role, content: m.content.slice(0, 1000).trim() }))
    .filter((m) => m.content);
  while (msgs.length && msgs[0].role !== "user") msgs.shift();
  if (!msgs.length || msgs[msgs.length - 1].role !== "user") return null;
  return msgs;
}

app.post("/api/chat", async (req, res) => {
  const messages = cleanMessages(req.body?.messages);
  if (!messages) return res.status(400).json({ error: "Send a list of messages that ends with the child's message." });
  const subject = SUBJECTS.includes(req.body.subject) ? req.body.subject : "General";
  const ageBand = AGE_BANDS.includes(req.body.ageBand) ? req.body.ageBand : "8-10";

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 400,
      system: buildSystemPrompt(subject, ageBand),
      messages,
    });
    const reply = response.content.filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
    res.json({ reply: reply || "Let's try that again. Can you say it another way?" });
  } catch (err) {
    console.error("Claude request failed:", err?.status || "", err?.message || err);
    res.status(502).json({ error: "The tutor is resting right now. Please try again in a minute." });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Tutor server running on http://localhost:${port}`));
