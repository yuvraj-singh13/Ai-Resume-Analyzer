import { Router } from "express";
import upload from "../middleware/upload.js";
import { parseResumeFromBuffer } from "../services/resumeParser.js";
import { matchResumeToJD } from "../services/jdMatcher.js";
import Resume from "../models/Resume.js";
import JDMatchResult from "../models/JDMatchResult.js";

const router = Router();

/**
 * POST /api/resume/parse
 * multipart/form-data, field name "resume" (a .pdf or .docx file)
 * Equivalent of: uploaded_file -> load_resume_text_from_bytes -> parse_resume
 * in main.py, and `python parser.py resume.pdf` on the CLI.
 */
router.post("/parse", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Please upload a PDF or DOCX resume file." });
    }

    const resume = await parseResumeFromBuffer(req.file.buffer, req.file.originalname);

    let savedId = null;
    try {
      const doc = await Resume.create({ ...resume, sourceFileName: req.file.originalname });
      savedId = doc._id;
    } catch (persistError) {
      // Persistence is a convenience layer; parsing still succeeds even
      // if MongoDB is temporarily unavailable.
      console.warn("[mongo] failed to persist parsed resume:", persistError.message);
    }

    return res.json({ resume, resumeId: savedId });
  } catch (error) {
    console.error("[/api/resume/parse]", error);
    return res.status(500).json({ error: error.message || "Failed to parse resume." });
  }
});

/**
 * POST /api/resume/match
 * body: { resume: <structured resume object>, jdText: string, resumeId?: string }
 * Equivalent of match_resume_to_jd() invocation in main.py's
 * "Match with job description" button, and `python matcher.py resume.pdf jd.txt`.
 */
router.post("/match", async (req, res) => {
  try {
    const { resume, jdText, resumeId } = req.body || {};

    if (!resume) {
      return res.status(400).json({ error: "Please parse a resume first." });
    }
    if (!jdText || !jdText.trim()) {
      return res.status(400).json({ error: "Please paste a Job Description." });
    }

    const result = await matchResumeToJD(resume, jdText);

    try {
      await JDMatchResult.create({
        resume: resumeId || null,
        jd_text: jdText,
        ...result,
      });
    } catch (persistError) {
      console.warn("[mongo] failed to persist match result:", persistError.message);
    }

    return res.json(result);
  } catch (error) {
    console.error("[/api/resume/match]", error);
    return res.status(500).json({ error: error.message || "Failed to match resume against JD." });
  }
});

/**
 * GET /api/resume/history
 * Optional convenience endpoint backed by MongoDB (the "M" in MERN).
 * Does not change or replace any original feature - the core parse/match
 * flow above matches the Python app 1:1.
 */
router.get("/history", async (req, res) => {
  try {
    const [resumes, matches] = await Promise.all([
      Resume.find().sort({ createdAt: -1 }).limit(20),
      JDMatchResult.find().sort({ createdAt: -1 }).limit(20),
    ]);
    return res.json({ resumes, matches });
  } catch (error) {
    console.error("[/api/resume/history]", error);
    return res.status(500).json({ error: "Failed to load history (is MongoDB running?)." });
  }
});

export default router;
