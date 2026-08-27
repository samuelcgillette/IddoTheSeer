import express from "express";
import { deepAgent } from "../server.js";
const router = express.Router();

router.post("/", async (req, res) => {
    const { userPrompt } = req.body;
    
    try {
        const response = await deepAgent.invoke(
            {messages: [{ role: "user", content: userPrompt }],}, 
            {configurable: { thread_id: "new-search" } },
        );
        console.log("Agent response:", response);
        const finalMessage = response.messages[response.messages.length - 1];
        res.json({ AIResponse: finalMessage.content });
    }
    catch (error) {
        console.error("Error invoking agent:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
