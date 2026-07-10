const express = require("express");
const cors = require("cors");
const multer = require("multer");
const dotenv = require("dotenv");
const OpenAI = require("openai");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const app = express();
app.use(cors());
app.use(express.json());


// Store uploaded file in memory (not saved to disk)
const upload = multer({ storage: multer.memoryStorage() });

// Extract raw text from PDF or DOCX buffer
async function extractText(file) {
  if (file.mimetype === "application/pdf") {
    const data = await pdfParse(file.buffer);
    return data.text;
  } else if (
    file.mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value;
  } else {
    throw new Error("Unsupported file type. Please upload PDF or DOCX.");
  }
}

app.post("/api/match", upload.single("resume"), async (req, res) => {
  try {
    const { jobDescription } = req.body;
    const resumeFile = req.file;

    if (!resumeFile || !jobDescription) {
      return res
        .status(400)
        .json({ error: "Resume file and job description are required." });
    }

    const resumeText = await extractText(resumeFile);

    const prompt = `
You are an expert technical recruiter and resume analyst.

Compare the RESUME below against the JOB DESCRIPTION below.

Return ONLY a valid JSON object (no markdown, no extra text) with this exact structure:
{
  "matchPercentage": <number 0-100>,
  "matchedSkills": [<array of skills/keywords found in both>],
  "missingSkills": [<array of important skills from job description missing in resume>],
  "improvementSuggestions": [<array of 4-6 specific, actionable suggestions to improve the resume for this job>],
  "summary": "<2-3 sentence overall assessment>"
}

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}
`;

    const completion = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    let rawResponse = completion.choices[0].message.content.trim();

    // Remove markdown code fences if the model adds them anyway
    rawResponse = rawResponse.replace(/```json|```/g, "").trim();

    const result = JSON.parse(rawResponse);

    res.json(result);
  } catch (error) {
    console.error("Error in /api/match:", error);
    res.status(500).json({ error: error.message || "Something went wrong." });
  }
});

app.get("/", (req, res) => {
  res.send("Resume Matcher backend is running.");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});