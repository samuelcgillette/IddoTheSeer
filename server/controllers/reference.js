import express from "express";
import { BookTitleAgent, PageCheckerAgent } from "../server.js";
import { getAbbreviation, getBookText,getNumberOfPages } from "../models/books.js";
import { getBookTitleFromAi, checkBookPage } from "../models/ai.js";
const router = express.Router();

router.post("/", async (req, res) => {
    const { userPrompt } = req.body;
    
    try {
        // use agent to get book 
        const bookTitle = await getBookTitleFromAi(userPrompt, BookTitleAgent);
        // get proper abreviation
        const abbreviation = getAbbreviation(bookTitle.trim());
        const maxNumPages = await getNumberOfPages(abbreviation);
        let currentPageNum = 1;
        // start the loop
        while ( currentPageNum <= maxNumPages ) {
            //get a page
            const pageText = await getBookText(abbreviation,currentPageNum);
            //send the page
            const aiResponse = await checkBookPage(pageText, PageCheckerAgent, userPrompt);
            //if it isnt the response loop again
            if ( aiResponse.includes('This is the place.')) {
                return res.json({ AIResponse: aiResponse });
            }
            else {
                currentPageNum = currentPageNum + 1;
            }
        }
        res.json({ AIResponse: 'The scripture you are looking for could not be found'})
    }
    catch (error) {
        console.error("Error invoking agent:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
