#Software link
https://resume-matcher-omega-six.vercel.app/
 # AI Resume & Job Matcher

An AI-powered web app that compares a resume against a job description and returns a match score, matched/missing skills, and tailored improvement suggestions.

## Features
- Upload resume as PDF or DOCX
- Paste any job description
- AI-generated match percentage
- List of matched and missing skills
- Actionable suggestions to improve the resume for the target role

## Tech Stack
**Frontend:** React, Vite, Axios, Lucide Icons
**Backend:** Node.js, Express
**AI:** Groq API (Llama 3.3 70B)
**File Parsing:** pdf-parse, mammoth

## How It Works
1. User uploads a resume and pastes a job description
2. Backend extracts text from the resume file
3. Both texts are sent to an LLM with a structured prompt
4. AI returns a match score, skill comparison, and suggestions
5. Results are displayed in a clean, interactive UI

## Getting Started

### Backend
\`\`\`bash
cd backend
npm install
npm run dev
\`\`\`

### Frontend
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

Create a `.env` file in the `backend` folder with:
\`\`\`
GROQ_API_KEY=your_key_here
PORT=5050
\`\`\`

## Author
Akarsh Yadav# resume-matcher

