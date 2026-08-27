export async function getBookTitleFromAi(userPrompt, BookTitleAgent) {
    const response = await BookTitleAgent.invoke(
        {messages: [{ role: "user", content: userPrompt }],}, 
        {configurable: { thread_id: "new-search" } },
    );
    const finalMessage = response.messages[response.messages.length - 1];
    return finalMessage;
}