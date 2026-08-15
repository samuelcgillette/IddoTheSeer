import express from "express";
import { agent } from "../server.js";
const router = express.Router();

router.post("/", async (req, res) => {
    const { userPrompt } = req.body;
    
    try {
        const response = await agent.invoke({
            messages: [{ role: "user", content: userPrompt }],
        });
        const finalMessage = response.messages[response.messages.length - 1];
        res.json({ AIResponse: finalMessage.content });
    }
    catch (error) {
        console.error("Error invoking agent:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
