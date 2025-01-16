import express, { Request, Response } from "express";
import dotenv from "dotenv";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());


app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript with Node.js!");
});


app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
