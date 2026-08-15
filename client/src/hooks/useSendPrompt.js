import {useEffect, useState} from "react";

export function useSendPrompt(prompt, setModelResponse) {
    useEffect(() => {
        async function sendPrompt() {
            if (prompt) {
                try {
                    const response = await fetch("/api/findreference", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ userPrompt: prompt }),
                    });
                    const data = await response.json();
                    setModelResponse(data.AIResponse);

                } catch (error) {
                    console.error("Error sending prompt:", error);
                }
            }
        }
        sendPrompt();
    }, []);
}