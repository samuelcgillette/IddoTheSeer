import "dotenv/config";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { create } from "express-handlebars";
import { ChatOllama } from "@langchain/ollama";
import { createDeepAgent } from "deepagents";
import { createAgent } from "langchain";
import referenceController from "./controllers/reference.js";
import { MemorySaver } from "@langchain/langgraph";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const VITE_ORIGIN = process.env.VITE_ORIGIN || "http://localhost:5173";

// Handlebars setup
const hbs = create({ defaultLayout: false });
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.json());

// Initialize AI model and prompts
const BOOK_TITLE_SYSTEM_PROMPT = `You are only a Bible book title extractor. Read the user's message and return the part of the Bible they want to search. Besides the 66 individual books, these four names are also valid answers and must be returned when the user names them: "Psalms" (also for "psalm" or "a psalm"), "Old Testament", "New Testament", and "Bible" (also for "bible verse", "scripture", or "the Bible" in general). If the user names a specific book, return that book's full title, e.g. "Luke", "Genesis", "1 John". Use only the words in the user's message; do not use your own knowledge to guess which book a story or verse comes from. Return only the title as plain text with no explanation and no extra words. If the message does not name a specific book or Testament, return "Bible".`;
const MATCH_FINDER_SYSTEM_PROMPT = `You find Bible verses that match the user's request. Pick out words or short phrases from the request that are likely to appear in the verse itself, for example "vine" for a question about Jesus calling himself the vine. Do not search for the book name or very common words such as Jesus, God, Lord, or said. Call get_matching_pages once for each word or phrase. Read the pages it returns, and for every verse that matches the user's request, call save_match with the page number, the reference (the chapter is shown in the page header, e.g. John 15:1), the verse copied exactly as it appears on the page, and a short reason. The text is the King James Version, so if a search finds nothing, try other forms of the word (singular or plural) or older wording. If a search returns too many pages, use a more specific phrase. Use only the page text, never your own knowledge of the Bible. When you have finished searching, reply with "Done".`;
const MATCH_COMPARER_SYSTEM_PROMPT = `You choose the best answer to the user's Bible question. Call load_matches to see the verses that were found as possible matches. Compare each one with the user's request and choose the single best fit. Use only the saved matches; never use your own knowledge of the Bible. Call choose_match with the matchNumber of the best fit and one sentence explaining why it answers the user's question. When you have chosen, reply with "Done".`;

const llm = new ChatOllama({
  model: "gpt-oss:20b",
  temperature: 0,
  timeout: 600_000, // 10 minutes
  numCtx: 16384, // room for several searched pages + prompts
  numPredict: 2048, // cap on response length
});

export const BookTitleAgent = createAgent({
  model: llm,
  tools: [],
  systemPrompt: BOOK_TITLE_SYSTEM_PROMPT,
});

export const createMatchFinderAgent = (tools) => createAgent({
  model: llm,
  tools,
  systemPrompt: MATCH_FINDER_SYSTEM_PROMPT,
});

export const createMatchComparerAgent = (tools) => createAgent({
  model: llm,
  tools,
  systemPrompt: MATCH_COMPARER_SYSTEM_PROMPT,
});

// API Routes
app.use("/api/reference", referenceController);

// Serve the React app
if (process.env.NODE_ENV === "production") {
  // In production, load the Vite manifest and serve built files from client/dist
  const manifestPath = path.join(
    __dirname,
    "../client/dist/.vite/manifest.json"
  );
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  const entries = Object.values(manifest).filter((e) => e.isEntry);
  const jsFiles = entries.map((e) => e.file);
  const cssFiles = [...new Set(entries.flatMap((e) => e.css || []))];

  app.use(express.static(path.join(__dirname, "../client/dist")));

  app.get("*", (req, res) => {
    res.render("index", {
      isDev: false,
      jsFiles,
      cssFiles,
    });
  });
} else {
  // In development, redirect asset/file requests to the Vite dev server
  app.use((req, res, next) => {
    if (req.path.includes(".")) {
      return res.redirect(`${VITE_ORIGIN}${req.path}`);
    }
    next();
  });

  // In development, Express serves the HTML which loads JS from Vite dev server
  app.get("*", (req, res) => {
    res.render("index", { isDev: true, viteOrigin: VITE_ORIGIN });
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
