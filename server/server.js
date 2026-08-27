import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { create } from "express-handlebars";
import { loadUser } from "./middleware/auth.js";
import authController from "./controllers/auth.js";
import { ChatOllama } from "@langchain/ollama";
import { createDeepAgent } from "deepagents";
import { createAgent } from "langchain"; 
import { getAbbreviation, getBookText, getAllNewTestament, getOldTestament, getAllBible, getNumberOfPages } from "./tools.js";
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
app.use(cookieParser());
app.use(loadUser);

// Initialize AI model and system prompt
const SYSTEM_PROMPT = `You are a scripture assistant. Find the Bible book, chapter, and verse that best matches the user's words or request. Search the provided text tools; never invent scripture content, abbreviations, or references. Return up to three possible references when the match is uncertain. If no match is found, say that you do not have enough information. Quote verses exactly as returned by the tools; do not summarize them.

## Tool rules
- For a known book, use this flow: call get_abbreviation with the book name, call get_number_of_pages with its returned abbreviation, then call get_book_text repeatedly with pageNumber as numeric strings starting at "1" and increasing by 1. Stop when you find the answer or reach the reported page count. 
- Use get_all_new_testament, get_old_testament, or get_all_bible only when you do not know which specific book contains the answer. When the book is known, use the specific-book flow instead. For these broad tools, pass pageNumber as a numeric string starting at "1" and increment through the available pages as needed.
- Do not call get_abbreviation unless the user identifies or requests a specific book. Use only the abbreviation returned by that tool; do not create one yourself.

## References
Format references as Book Chapter:Verse, for example John 13:32-35. In get_book_text output, a number immediately followed by //1 marks a chapter boundary (for example, //3 //1); other verse numbers mark the beginning of the following verse. Use the text and these markers to identify chapter and verse numbers. In your response, always include the reference(s) and the quoted verse text exactly as returned by the tools. If you cannot find a match, say that you do not have enough information to provide a reference.
`;

const llm = new ChatOllama({
  model: "llama3.1:8b",
  temperature: 0,
  timeout: 600_000, // 10 minutes
  maxTokens: 128000,
});

// Create the Agent
const checkpointer = new MemorySaver();
export const deepAgent = createDeepAgent({
  model: llm,
  systemPrompt: SYSTEM_PROMPT,
  tools: [getAbbreviation, getBookText, getNumberOfPages, getAllNewTestament, getOldTestament, getAllBible],
  checkpointer,
});

// API Routes
app.use("/api/auth", authController);
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
