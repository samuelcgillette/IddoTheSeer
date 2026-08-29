import crypto from "crypto";

export async function getBookTitleFromAi(userPrompt, BookTitleAgent) {
    console.log(`\n[System] Received user prompt log 2: ${userPrompt}`);
    const uniqueThreadId = crypto.randomUUID(); 
    const response = await BookTitleAgent.invoke(
        {messages: [{ role: "user", content: userPrompt }],}, 
        {configurable: { thread_id: uniqueThreadId } },
    );
    const finalMessage = response.messages[response.messages.length - 1];
    return finalMessage.content;
}

export async function checkBookPage(bookPage, PageCheckerAgent, userPrompt) {
    const uniqueThreadId = crypto.randomUUID(); 
    const response = await PageCheckerAgent.invoke(
        {messages: [{ role: "user", content: `User request:\n${userPrompt}\n\nBible page:\n${bookPage}` }],}, 
        {configurable: { thread_id: uniqueThreadId } },
    );
    const finalMessage = response.messages[response.messages.length - 1];
    return finalMessage.content;
}