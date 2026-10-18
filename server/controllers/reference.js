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
        // use agent to get book
        const bookTitle = await getBookTitleFromAi(userPrompt, BookTitleAgent);
        console.log(`\n[System] Book title from AI: ${bookTitle}`);
        // get proper abreviation
        const abbreviation = getAbbreviation(bookTitle.trim());
        if (!abbreviation) {
            return res.json({ AIResponse: 'Please include the book of the Bible you are asking about.' });
        }
        // find agent searches for keywords and saves every matching verse
        const { matches, selection, finderTools, comparerTools } = createMatchTools(abbreviation);
        await findMatches(userPrompt, createMatchFinderAgent(finderTools));
        console.log(`\n[System] Matches found: ${matches.length}`);
        if (matches.length === 0) {
            return res.json({ AIResponse: 'The scripture you are looking for could not be found'});
        }
        // compare agent picks the best of the saved matches
        await compareMatches(userPrompt, createMatchComparerAgent(comparerTools));
        // fall back to the first match if the compare agent never chose one
        const bestMatch = selection.match ?? matches[0];
        // build the response from the saved match so the quote is exactly what was found on the page
        const aiResponse = `${bestMatch.reference} - "${bestMatch.quote}"\n${selection.explanation || bestMatch.reason}`;
        res.json({ AIResponse: aiResponse });
    }
    catch (error) {
        console.error("Error invoking agent:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
