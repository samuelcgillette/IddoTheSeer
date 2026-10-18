
export async function getBookTitleFromAi(userPrompt, BookTitleAgent) {
    const response = await BookTitleAgent.invoke(
        {messages: [{ role: "user", content: userPrompt }],}
    );
    const finalMessage = response.messages[response.messages.length - 1];
    return finalMessage.content;
}

export async function findMatches(userPrompt, MatchFinderAgent) {
    // Matches are saved through the save_match tool, so only the tool calls matter here
    await MatchFinderAgent.invoke(
        {messages: [{ role: "user", content: userPrompt }],},
        { recursionLimit: 50 }
    );
}

export async function compareMatches(userPrompt, MatchComparerAgent) {
    // The chosen match is recorded through the choose_match tool
    await MatchComparerAgent.invoke(
        {messages: [{ role: "user", content: userPrompt }],}
    );
}
