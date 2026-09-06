# 📄 Resume Analyzer & Job Description Matcher

A full-stack **MERN** (MongoDB, Express, React, Node.js) application that
parses resumes and matches them against job descriptions using an LLM.

> Upload a Resume (PDF / DOCX) → Extract Structured Information → Compare
> with a Job Description → Get ATS Match Score & Recruiter Insights

---

## ✨ Features

- Upload a **PDF** or **DOCX** resume
- Extract Name, Email, Phone Number
- Extract Education → university, degree, GPA (0–10 scale)
- Extract Experience → company, job title, duration, in-role project name/description/tech stack
- Extract standalone Projects (personal / academic / portfolio) with tech stack
- Extract Technical & Professional Skills
- Compare parsed resume against a pasted Job Description
- ATS Match Score (0–100), Matched Skills, Missing Skills, Strengths, Gaps, Recruiter Summary
- Download parsed resume and match result as JSON
- Aurora-gradient / glassmorphism UI
- Configurable LLM model via `GROQ_MODEL` (defaults to `openai/gpt-oss-120b`)
- Parsed resumes and match results are saved to MongoDB in the background, giving a persistent history across restarts

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) |
| Backend | Node.js + Express |
| Database | MongoDB (Mongoose) |
| LLM | Groq (`groq-sdk`) |
| Structured output | Groq `response_format: json_schema` (falls back to `json_object`) + Zod validation |
| PDF parsing | `pdf-parse` |
| DOCX parsing | `mammoth` (paragraphs + tables) + manual header/footer XML extraction (`jszip` + `fast-xml-parser`) |

---

## 📂 Project Structure

```text
resume-analyzer-mern/
├── server/                      # Express + MongoDB API
│   ├── src/
│   │   ├── index.js             # App entrypoint
│   │   ├── config/db.js         # Mongoose connection
│   │   ├── models/              # Resume.js, JDMatchResult.js (Mongoose)
│   │   ├── schemas/             # Zod schemas + JSON Schemas sent to Groq
│   │   ├── prompts/prompts.js   # LLM prompt templates
│   │   ├── services/
│   │   │   ├── groqClient.js    # Groq client setup
│   │   │   ├── resumeParser.js  # Resume parsing logic
│   │   │   └── jdMatcher.js     # JD matching logic
│   │   ├── middleware/upload.js # Multer (in-memory, no temp files persisted)
│   │   ├── utils/fileText.js    # Text extraction from uploaded files
│   │   └── routes/resumeRoutes.js
│   ├── package.json
│   └── .env.example
│
├── client/                      # React (Vite) frontend
│   ├── src/
│   │   ├── App.jsx              # Main app flow
│   │   ├── index.css            # Global styles
│   │   ├── api/api.js           # Axios calls to the Express API
│   │   └── components/
│   │       ├── UploadSection.jsx
│   │       ├── ResumeProfile.jsx
│   │       ├── MatchResult.jsx
│   │       └── SkillTags.jsx
│   ├── index.html
│   └── package.json
│
├── resume.pdf                   # Sample resume
├── jd.txt                       # Sample job description
└── README.md
```

---

## ⚙ Installation & Running

### 1. Prerequisites

- Node.js 18+
- A MongoDB instance (local `mongodb://127.0.0.1:27017` works, or use Atlas)
- A free Groq API key from [console.groq.com](https://console.groq.com)

### 2. Backend

```bash
cd server
npm install
cp .env.example .env
# edit .env and set GROQ_API_KEY (and MONGODB_URI if not using localhost)
npm start
```

The API runs on `http://localhost:5000` by default. It starts serving
immediately even if MongoDB isn't reachable yet — parsing/matching only need
Groq; MongoDB is only required for the optional `/api/resume/history` endpoint.

### 3. Frontend

```bash
cd client
npm install
npm run dev
```

The React app runs on `http://localhost:5173` and proxies `/api` requests to
the Express server (see `vite.config.js`).

### 4. Production build (frontend)

```bash
cd client
npm run build
```

Serve the `dist/` folder with any static file server, or have Express serve
it directly (add `express.static` pointing at `client/dist` in `index.js`
and set `CLIENT_ORIGIN` accordingly).

---

## 🔑 Environment Variables (`server/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `GROQ_API_KEY` | ✅ Yes | — | Groq API key. The API returns a clear error if unset. |
| `GROQ_MODEL` | ⬜ No | `openai/gpt-oss-120b` | Any Groq-hosted model ID. |
| `MONGODB_URI` | ⬜ No | `mongodb://127.0.0.1:27017/resume_analyzer` | Used only for history persistence. |
| `PORT` | ⬜ No | `5000` | Express server port. |
| `CLIENT_ORIGIN` | ⬜ No | `http://localhost:5173` | Comma-separated list of allowed CORS origins. |

---

## 🔌 API Reference

### `POST /api/resume/parse`
`multipart/form-data`, field `resume` (a `.pdf` or `.docx` file).

Returns:
```json
{ "resume": { "name": "...", "email": "...", "education": [...], ... }, "resumeId": "..." }
```

### `POST /api/resume/match`
```json
{ "resume": { ... }, "jdText": "...", "resumeId": "optional-mongo-id" }
```

Returns a `JDMatchResult`:
```json
{
  "match_score": 82.5,
  "matched_skills": ["Python", "FastAPI"],
  "missing_skills": ["Docker"],
  "strengths": ["..."],
  "gaps": ["..."],
  "summary": "..."
}
```

### `GET /api/resume/history`
Returns the 20 most recently parsed resumes and 20 most recent match
results from MongoDB.

---

## 🧯 Troubleshooting

| Message | Cause & Fix |
|---|---|
| `GROQ_API_KEY not found. Please add it to your .env file.` | Create `server/.env` from `.env.example` and add a valid key. |
| `Unsupported resume format. Please upload a PDF or DOCX file.` | Only `.pdf` and `.docx` are supported. |
| `Please parse a resume first.` | Parse a resume before matching against a JD. |
| `Please paste a Job Description.` | The JD text area cannot be empty. |
| `/api/resume/history` fails | MongoDB isn't reachable — check `MONGODB_URI`. Parsing/matching still work without it. |
| Model decommissioned / not found | Set `GROQ_MODEL` in `.env` to a model your Groq account can access. |

---

## 📜 License

MIT
