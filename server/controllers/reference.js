import express from "express";
import { deepAgent } from "../server.js";
import { getAbbreviation } from "../models/books.js";
import { getBookTitleFromAi } from "../models/ai.js";
const router = express.Router();

router.post("/", async (req, res) => {
    const { userPrompt } = req.body;
    
    try {
        // use agent to get book 
        const bookTitle = getBookTitleFromAi(userPrompt, deepAgent);
        // get proper abreviation
        const abbreviation = getAbbreviation(bookTitle);
        // start the loop
        while ( x=0 ) {
            //get a page
            //send the page
            //if it isnt the response loop again

        }

        const response = await deepAgent.invoke(
            {messages: [{ role: "user", content: userPrompt }],}, 
            {configurable: { thread_id: "new-search" } },
        );
        console.log("Agent response:", response);
        res.json({ AIResponse: finalMessage.content });
    }
    catch (error) {
        console.error("Error invoking agent:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
