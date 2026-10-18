import { useEffect, useRef, useState } from "react";
import { useSendPrompt } from "../hooks/useSendPrompt.js";
import { Composer } from "../components/Composer";
import { EmptyState } from "../components/EmptyState";
import { SeerReply, SeerSearching } from "../components/SeerReply";

function Home() {
  const [messages, setMessages] = useState([]);
  const { sendPrompt, pending } = useSendPrompt();
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, pending]);

  async function handleAsk(prompt) {
    setMessages((prev) => [...prev, { role: "user", text: prompt }]);
    const reply = await sendPrompt(prompt);
    setMessages((prev) => [...prev, { ...reply, prompt }]);
  }

  // Drop the failed reply and send the same question again
  async function handleRetry(index, prompt) {
    setMessages((prev) => prev.filter((_, i) => i !== index));
    const reply = await sendPrompt(prompt);
    setMessages((prev) => [...prev, { ...reply, prompt }]);
  }

  return (
    <div className="chat">
      {messages.length === 0 ? (
        <EmptyState onPick={handleAsk} />
      ) : (
        <ol className="thread">
          {messages.map((m, i) => (
            <li key={i}>
              {m.role === "user" ? (
                <div className="message message--user"><p>{m.text}</p></div>
              ) : (
                <SeerReply
                  text={m.text}
                  error={m.error}
                  onRetry={!pending && i === messages.length - 1 ? () => handleRetry(i, m.prompt) : undefined}
                />
              )}
            </li>
          ))}
          {pending && <li><SeerSearching /></li>}
        </ol>
      )}
      <div ref={endRef} />
      <Composer onSubmit={handleAsk} disabled={pending} />
    </div>
  );
}

export default Home;
