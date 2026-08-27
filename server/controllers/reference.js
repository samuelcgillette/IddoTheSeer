import express from "express";
import { deepAgent } from "../server.js";
import { getAbbreviation, getBookText,getNumberOfPages } from "../models/books.js";
import { getBookTitleFromAi, checkBookPage } from "../models/ai.js";
const router = express.Router();

router.post("/", async (req, res) => {
    const { userPrompt } = req.body;
    
    try {
        // use agent to get book 
        const bookTitle = getBookTitleFromAi(userPrompt, deepAgent);
        // get proper abreviation
        const abbreviation = getAbbreviation(bookTitle);
        const maxNumPages = getNumberOfPages(abbreviation);
        let currentPageNum = 0;
        // start the loop
        while ( currentPageNum < maxNumPages ) {
            //get a page
            const pageText = getBookText(abbreviation,currentPageNum);
            //send the page
            const aiResponse = checkBookPage(pageText);
            //if it isnt the response loop again
            if ( aiResponse.includes('This is the place.')) {
                currentPageNum = maxNumPages
                res.json({ AIResponse: aiResponse });
            }
            else {
                currentPageNum = currentPageNum + 1
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
