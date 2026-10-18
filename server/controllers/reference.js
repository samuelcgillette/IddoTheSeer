import express from "express";
import { BookTitleAgent, createMatchFinderAgent, createMatchComparerAgent } from "../server.js";
import { getAbbreviation } from "../models/books.js";
import { getBookTitleFromAi, findMatches, compareMatches } from "../models/ai.js";
import { createMatchTools } from "../tools.js";
const router = express.Router();

router.post("/", async (req, res) => {
    const { userPrompt } = req.body;
    console.log(`\n[System] Received user prompt: ${userPrompt}`);

    try {
        const bookTitle = await getBookTitleFromAi(userPrompt, BookTitleAgent);
        console.log(`\n[System] Book title from AI: ${bookTitle}`);
        const abbreviation = getAbbreviation(bookTitle.trim());
        if (!abbreviation) {
            return res.json({ AIResponse: 'Please include the book of the Bible you are asking about.' });
        }
        const { matches, selection, finderTools, comparerTools } = createMatchTools(abbreviation);
        await findMatches(userPrompt, createMatchFinderAgent(finderTools));
        console.log(`\n[System] Matches found: ${matches.length}`);
        if (matches.length === 0) {
            return res.json({ AIResponse: 'The scripture you are looking for could not be found'});
        }
        await compareMatches(userPrompt, createMatchComparerAgent(comparerTools));
        const bestMatch = selection.match ?? matches[0];
        const aiResponse = `${bestMatch.reference} - "${bestMatch.quote}"\n${selection.explanation || bestMatch.reason}`;
        res.json({ AIResponse: aiResponse });
    }
    catch (error) {
        console.error("Error invoking agent:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
