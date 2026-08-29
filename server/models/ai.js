
export async function getBookTitleFromAi(userPrompt, BookTitleAgent) {
    const response = await BookTitleAgent.invoke(
        {messages: [{ role: "user", content: userPrompt }],}
    );
    const finalMessage = response.messages[response.messages.length - 1];
    return finalMessage.content;
}

export async function checkBookPage(bookPage, PageCheckerAgent, userPrompt) {
    const response = await PageCheckerAgent.invoke(
        {messages: [{ role: "user", content: `User request:\n${userPrompt}\n\nBible page:\n${bookPage}` }],}
    );
    const finalMessage = response.messages[response.messages.length - 1];
    return finalMessage.content;
}