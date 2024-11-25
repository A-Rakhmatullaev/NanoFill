// let session;

async function runPrompt(prompt, params) {
    try {
        // if (!session) {
            session = await chrome.aiOriginTrial.languageModel.create(params);
        // }
        return session.prompt(prompt);
    } catch (e) {
        console.log('Prompt failed');
        console.error(e);
        console.log('Prompt:', prompt);
        throw e;
    }
}

const sysPromptTemplate = 'You are part of an autofill application. End every response with "...there you go". You receive html that includes an input field and respond with the type of information that it would be correct to autofill that field with as well as your confidence that you are correct. Valid types of information are %valid types%. Only ever respond with a valid information type. For example if you received <input id=username required> you might respond with "username:96%...there you go". If the input is not formatted as html, or you have no good guesses respond with "unidentifiable".'
let sysPrompt;
let params = {
    systemPrompt: sysPrompt,
    temperature: 0.1,
    topK: 2
};
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Message received from content script:", message);
    if (message.type === "UPDATE") {
        sysPrompt = sysPromptTemplate.replace("%valid types%", message.message);
        params = {
            systemPrompt: sysPrompt,
            temperature: 0.1,
            topK: 2
        };
        console.log("SysPrompt:", sysPrompt);
    } else {
        try {
            runPrompt(message.message, params).then(result => {
                console.log(result);
                sendResponse({reply: result});
            }).catch(error => {
                console.log(error);
                sendResponse({reply: "error: " + error});
            });
        }catch (error) {
            console.log(error);
            sendResponse({reply: "error: " + error});
        }
    }

    return true; // Keep the messaging channel open for asynchronous sendResponse
});