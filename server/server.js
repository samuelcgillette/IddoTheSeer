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

// Initialize AI model and prompts
const BOOK_TITLE_SYSTEM_PROMPT = `A Bible book is one of the canonical books of the Bible, such as Genesis, Psalms, Matthew, or Revelation. Find the Bible book named or clearly requested in the user's prompt. Return only the complete book title.If the user wants the entire Bible, return "Bible". If the user wants the Old Testament, return "Old Testament". If the user wants the New Testament, return "New Testament". If you cannot find a book, return "Unknown".`;
const PAGE_CHECKER_SYSTEM_PROMPT = `Compare the user's request with the provided Bible page. If the page contains the requested scripture, start the response with exactly "This is the place." Then include the matching reference and quote the scripture exactly as it appears, without summarizing. If it does not contain the request, say that it is not on this page.`;

const llm = new ChatOllama({
  model: "llama3.1:8b",
  temperature: 0,
  timeout: 600_000, // 10 minutes
  maxTokens: 128000,
});

// Create the agents
const checkpointer = new MemorySaver();
export const BookTitleAgent = createDeepAgent({
  model: llm,
  systemPrompt: BOOK_TITLE_SYSTEM_PROMPT,
  checkpointer,
});

export const PageCheckerAgent = createDeepAgent({
  model: llm,
  systemPrompt: PAGE_CHECKER_SYSTEM_PROMPT,
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
