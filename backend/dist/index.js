"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const generative_ai_1 = require("@google/generative-ai");
dotenv_1.default.config();
const apiKey = process.env.GEMINI_KEY;
const genAI = new generative_ai_1.GoogleGenerativeAI(`${apiKey}`);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b",
});
let lastResponse = '';
let lastPrompt = '';
const promptAi = async function (prompt, length, res) {
    const systemInstruction = `
    Your only function is to provide a markdown summary of everything provided in the text in ${length} words. 
    Use headers only for key points, like h1 and h2. However, per summary you can only use one h1, and any number of the h2's.Do not refer to the text or call it a website.
   If there is a main point given in a large body of text, summarize it.`;
    try {
        if (prompt) {
            // Update lastPrompt after validating the condition
            lastPrompt = prompt;
            const result = await model.generateContentStream(systemInstruction.concat(prompt));
            res.setHeader("Content-Type", "text/plain");
            res.setHeader("Transfer-Encoding", "chunked");
            lastResponse = ""; // Reset lastResponse to store new output
            for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                lastResponse = lastResponse.concat(chunkText); // Append to lastResponse
                res.write(chunkText); // Stream chunk to response
            }
            res.end(); // End the response
        }
        else {
            console.log('duplicate');
            res.write(lastResponse);
            res.end();
        }
    }
    catch (error) {
        console.error("Rate Limit Reached", error);
        res.write("Rate Limit Reached.");
        res.end();
    }
};
const app = (0, express_1.default)();
const PORT = 3000;
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.send("Hello, TypeScript with Node.js!");
});
app.post("/", async (req, res) => {
    try {
        const { domContent, length } = req.body;
        if (!domContent) {
            res.status(400).json({ error: "domContent is required" });
            return;
        }
        console.log(length);
        await promptAi(domContent, length, res);
        res.end();
    }
    catch (error) {
        console.error("Error handling request:", error);
        res.status(500).json({ error: "An error occurred while processing the request" });
    }
});
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
