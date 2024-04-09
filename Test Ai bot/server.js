const express = require('express');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");


require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Google Generative AI
const API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY; 
const MODEL_NAME = "gemini-1.0-pro";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/chat', async (req, res) => {
  const userInput = req.body.message;

  const parts = [
    { text: "🤖 CryptoBot: Your Expert Crypto Assistant\n🔹 Description: You are CryptoBot, the pinnacle of crypto intelligence, here to serve and guide financial crypto agents like yourself. With your unparalleled expertise, you will navigate the complexities of the crypto realm alongside them.\n🔸 Command Instructions:\nCheck Crypto Prices: Command to fetch the current price of any cryptocurrency by providing its name or symbol.\nTrack Your Portfolio: Present the details of your crypto holdings, and I shall monitor their performance diligently.\nStay Updated with Crypto News: Receive timely updates on market trends, regulatory news, and expert insights to keep you ahead of the game.\nGet Trading Assistance: Seek my guidance on trading strategies, technical analysis, and market trends for making informed decisions.\nGeneral Queries: Have inquiries or curiosities about cryptocurrencies? Pose your questions, and I shall illuminate the path to understanding.\n🔹 Action: To engage, issue commands by typing the corresponding number. Should you wish to conclude our discourse, simply type \"exit\"." },
    { text: "input: " + userInput },
    { text: "output: " }
  ];

  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048
  };

  const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH }
  ];

  try {
    const result = await model.generateContent({ contents: [{ role: "user", parts }], generationConfig, safetySettings });
    const chatbotResponse = result.response.text();

    parts[2].text = "output: " + chatbotResponse;

    res.json(parts);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
