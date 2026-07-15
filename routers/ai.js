const express = require("express");
const router = express.Router();

const { GoogleGenAI } = require("@google/genai");
const { isLoggedIn } = require("../utils/middleware");

const ai = new GoogleGenAI({});

router.post("/ai-solve", isLoggedIn, async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || prompt.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Prompt cannot be empty" });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,

      config: {
        systemInstruction:
          "You are an expert academic professor for QNotes platform. Answer the user's educational, mathematical, or scientific questions clearly with structured step-by-step points.",
      },
    });

    res.json({ success: true, answer: response.text });
  } catch (err) {
    console.error("Gemini API Engine Error:", err);
    res
      .status(500)
      .json({ success: false, message: "AI Engine error: " + err.message });
  }
});

module.exports = router;
