"use strict";
import express, { Request, Response } from "express";
import dotenv from "dotenv";


import { GoogleGenerativeAI } from "@google/generative-ai";




dotenv.config();



const apiKey= process.env.GEMINI_KEY!;

const genAI = new GoogleGenerativeAI(`${apiKey}`);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b",

 });

 let lastResponse:string = '';
 let lastPrompt:string = '';

 const promptAi = async function (prompt: string, length:number, res: Response) {
  const systemInstruction =
    `Your only function is to provide a markdown summary of everything provided in the text in ${length} words. 
     Use headers only for key points, like h1 and h2. However, per summary you can only use one h1, and any number of the h2's.Do not refer to the text or call it a website.
    If there is a main point given in a large body of text, summarize it.`

  try {

    if (prompt ) {
      // Update lastPrompt after validating the condition
      lastPrompt = prompt;

      const result = await model.generateContentStream(
        systemInstruction.concat(prompt)
      );

      res.setHeader("Content-Type", "text/plain");
      res.setHeader("Transfer-Encoding", "chunked");

      lastResponse = ""; // Reset lastResponse to store new output
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        lastResponse = lastResponse.concat(chunkText); // Append to lastResponse
        res.write(chunkText); // Stream chunk to response
      }
      res.end(); // End the response
    } else {
      console.log('duplicate')

      res.write(lastResponse);
      res.end();
    }
  } catch (error) {

    console.error("Rate Limit Reached", error);
    res.write("Rate Limit Reached.");
    res.end();
  }
};





const app = express();
const PORT = 3000;


app.use(express.json());


app.get("/", (req: Request, res: Response) => {

  res.send("Hello, TypeScript with Node.js!");
});





app.post("/", async (req: Request, res: Response) => {
  try {

    const { domContent, length } = req.body;
    if (!domContent) {
      res.status(400).json({ error: "domContent is required" });
      return;
    }
console.log(length)

    await promptAi(domContent,length, res);


    res.end();
  } catch (error) {
    console.error("Error handling request:", error);
    res.status(500).json({ error: "An error occurred while processing the request" });
  }
});



app.listen(PORT,"0.0.0.0", () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});