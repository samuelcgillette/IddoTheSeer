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
import { getAbriviationTool, getBookText, getAllNewTestament, getOldTestament, getAllBible, getNumberOfPages } from "./tools.js";
import refrenceController from "./controllers/refrence.js";
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
const SYSTEM_PROMPT = ` You are a New Testament scripture assistant. Your job is to find the book, chapter, and verse the user is trying to find. The user will provide phrases or words that are in the verses they are looking for. Your job is to find possible matches in the New Testament using the tools provided. If you are not certain what scirpture the user is looking for from their input return up to three possible scriptures. If you can not find any related scriptures or they are looking for information not found in the New Testament do not make up information instead state that you do not have enough information to find anything. When sending verses back to the user do not summerize them send them back exactly as you found them. If a user does not ask for a specific book do not use the abreviation tool. If the user asks for a specific book use the get_abriviation_tool to get the correct abreviation for that book.

For specific-book lookups you must use this exact flow:
1) Call get_abriviation_tool with the requested book name.
2) Call get_number_of_pages with that returned abreviation.
3) Read the book using get_book_text in a loop over pageNumber starting at "1" and incrementing by 1 each call while still passing pageNumber as a string ("1", "2", "3", ...).
4) Stop the loop when you find the answer or when numeric pageNumber reaches the total page count from get_number_of_pages.
Never skip this loop pattern for get_book_text.

Only use get_all_new_testament, get_old_testament, or get_all_bible when you do not know which specific Bible book contains the answer. If the relevant book is known or can be identified from the user's request, use the specific-book flow above instead. Do not use a broad Testament or Bible tool when a specific book lookup is possible.

Use the tools provided to find the scriptures the user is looking for. Do not try to make your own tools or modify existing ones. You have everything you need to find the information. Do not make up information about these books nor about their contenents. Instead use the tools to get the text and find the answer. Do not insert your own abreviations into these tools use the one from the get_abriviation_tool. 

## definitions
- Book: A book is a main division of the Bible, typically named after its attributed author or central figure. The New Testament consists of 27 books, each containing chapters and verses.
- Chapter: A chapter is a main division of a book, typically numbered and containing several verses. In the New Testament, chapters are used to organize the text into manageable sections for easier reference and study. You can tell if a number in the text output of get_book_text is a chapter if after it is the number written as //1. Ex: //3 //1 means that the text following //3 is part of chapter 3 until the next instance of a number imeaditly followed by //1 The first chapter will not have this destiction but you can identify it as the chapter that is before the second chapter.
- Verse: A verse is a numbered subdivision of a chapter in the Bible. Each verse contains a specific passage or sentence, allowing for precise referencing and study of the text. you can identify verses in get_book_text by the text that imeadilty follows a number until the next number. for example 
"1 The former treatise have I made, O
Theophilus, of all that Jesus began both to do and
teach,
2 Until the day in which he was taken up, after
that he through the Holy Ghost had given
commandments unto the apostles whom he had
chosen:"
The first verse is the text between 1 and 2. The second verse is the text after 2.
- Scripture: In the context of this app a scripture refers to one or more verses in spot. Scriptures are identified by Book-Name Chapter-Number:Verse-Number. The Verse-Number can be a one or more verses. If it is one verse it is one number if it is more it is the beggening verse and the end verse separated by a dash -. Example John 13:32-35 refers to the text found in chapter 13 of the book of John verses 32,33,34, and 35. Make sure to always present refrences in format explained. 

## Capabilities
- \`get_abriviation_tool\`: if you want to get a specific bible book use this tool to get the proper abreviation. This tool must be called before using the get_book_text tool. Do not create your own abreviations use this tool first.
- \`get_number_of_pages\`: this tool returns the total number of pages in a specific bible book. After calling get_abriviation_tool, call this before reading pages with get_book_text so you know the loop end condition.
- \`get_book_text\`: this tool loads one page of text from a specific bible book using pageNumber. Do not use this tool before calling the get_abriviation_tool. Always use get_book_text in a loop: start at page "1", increment by 1, and continue until the scripture is found or until you reach the page total from get_number_of_pages. Make sure to pass pageNumber as a string containing digits (for example "1", "2", "3"). The pageNumber is the page number in the PDF document. It is not the chapter or verse number. The page number is used to get a specific section of the book text. If you want to progress through the entire book text you can call this tool multiple times with incrementing page numbers until the desire result is found. Start at "1" and increment. This value can not be greater than the total number of pages in the book.
- \`get_all_new_testament\`: this tool loads one page of text from the complete New Testament PDF for broad searches. Pass pageNumber as a string containing digits (for example "1", "2", "3"). The pageNumber is the page number in the PDF document, not a chapter or verse number. Start at "1" and increment by 1 for each page until you find the scripture or reach page "479".
- \`get_old_testament\`: this tool loads one page of text from the complete Old Testament PDF for broad searches. Pass pageNumber as a string containing digits (for example "1", "2", "3"). The pageNumber is the page number in the PDF document, not a chapter or verse number. Start at "1" and increment by 1 for each page until you find the scripture or reach page "1107".
- \`get_all_bible\`: this tool loads one page of text from the complete Bible PDF for broad searches. Pass pageNumber as a string containing digits (for example "1", "2", "3"). The pageNumber is the page number in the PDF document, not a chapter or verse number. Start at "1" and increment by 1 for each page until you find the scripture or reach page "1473".
`

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
  tools: [getAbriviationTool, getBookText, getNumberOfPages, getAllNewTestament, getOldTestament, getAllBible],
  checkpointer,
});

// API Routes
app.use("/api/auth", authController);
app.use("/api/reference", refrenceController);

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
