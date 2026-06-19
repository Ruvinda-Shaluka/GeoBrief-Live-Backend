import { Response } from "express";
import { Groq } from "groq-sdk";
import { AuthRequest } from "../middleware/authMiddleware.js";

const apiKey = process.env.GROQ_API_TOKEN || process.env.GROQ_API_KEY;
const groq = new Groq({ apiKey });

export const generateBrief = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { incidents } = req.body;

    if (!incidents || !Array.isArray(incidents)) {
      res.status(400).json({ message: "An array of incidents is required." });
      return;
    }

    if (incidents.length === 0) {
      res.status(200).json({ summary: "No incidents reported in this area. The location is safe and quiet." });
      return;
    }

    const promptContext = incidents.join("\n");
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Act as a civic news broadcaster. Summarize the following local incidents into a concise, professional 2-3 sentence briefing. Do not use conversational filler, just give the briefing."
        },
        {
          role: "user",
          content: promptContext
        }
      ],
      model: "llama3-8b-8192",
    });

    const summary = completion.choices[0]?.message?.content || "Could not generate summary.";
    res.status(200).json({ summary });
  } catch (error: any) {
    console.error("AI Briefing generation failed:", error);
    res.status(500).json({ message: "Server error generating AI briefing.", error: error.message });
  }
};
