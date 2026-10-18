import { useState } from "react";

// Sends a prompt to the reference endpoint and resolves to a seer message
export function useSendPrompt() {
  const [pending, setPending] = useState(false);

  async function sendPrompt(prompt) {
    setPending(true);
    try {
      const response = await fetch("/api/reference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userPrompt: prompt }),
      });
      const data = await response.json();
      if (!response.ok) {
        return { role: "seer", error: true, text: "Iddo couldn't finish that search. Ask again, or try different wording." };
      }
      return { role: "seer", text: data.AIResponse };
    } catch (error) {
      console.error("Error sending prompt:", error);
      return { role: "seer", error: true, text: "Iddo couldn't reach the server. Check that it's running, then ask again." };
    } finally {
      setPending(false);
    }
  }

  return { sendPrompt, pending };
}
