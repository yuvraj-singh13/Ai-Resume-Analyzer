import { useState } from "react";
import UploadSection from "./components/UploadSection.jsx";
import ResumeProfile from "./components/ResumeProfile.jsx";
import MatchResult from "./components/MatchResult.jsx";
import { parseResume, matchResumeToJD } from "./api/api.js";

function downloadJson(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 4)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Port of main.py's Streamlit flow:
 *   1. Upload resume -> Parse resume -> render structured profile
 *   2. Paste JD -> Match with job description -> render match result
 * The session-state resume in Streamlit becomes React state here.
 */
export default function App() {
  const [resume, setResume] = useState(null);
  const [resumeId, setResumeId] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState(null);
  const [parseSuccess, setParseSuccess] = useState(false);

  const [jdText, setJdText] = useState("");
  const [matchResult, setMatchResult] = useState(null);
  const [isMatching, setIsMatching] = useState(false);
  const [matchError, setMatchError] = useState(null);
  const [matchSuccess, setMatchSuccess] = useState(false);

  async function handleParse(file) {
    setIsParsing(true);
    setParseError(null);
    setParseSuccess(false);
    setMatchResult(null);
    try {
      const data = await parseResume(file);
      setResume(data.resume);
      setResumeId(data.resumeId || null);
      setParseSuccess(true);
    } catch (error) {
      setParseError(error?.response?.data?.error || error.message || "Failed to parse resume.");
    } finally {
      setIsParsing(false);
    }
  }

  async function handleMatch() {
    setMatchError(null);
    setMatchSuccess(false);

    if (!resume) {
      setMatchError("Please parse a resume first.");
      return;
    }
    if (!jdText.trim()) {
      setMatchError("Please paste a Job Description.");
      return;
    }

    setIsMatching(true);
    try {
      const result = await matchResumeToJD(resume, jdText, resumeId);
      setMatchResult(result);
      setMatchSuccess(true);
    } catch (error) {
      setMatchError(error?.response?.data?.error || error.message || "Failed to match resume against JD.");
    } finally {
      setIsMatching(false);
    }
  }

  return (
    <div className="block-container">
      <div className="hero">
        <div className="eyebrow">Resume analysis</div>
        <h1>Resume Analyzer</h1>
        <p>Upload a resume, extract structured information, and compare it with a Job Description.</p>
      </div>

      <UploadSection onParse={handleParse} isParsing={isParsing} />

      {parseError && <div className="alert alert-error">{parseError}</div>}
      {parseSuccess && !parseError && (
        <div className="alert alert-success">Resume parsed successfully.</div>
      )}

      {resume && (
        <>
          <hr />
          <div className="info-row">
            <div>
              <div className="section-title">Extracted resume information</div>
              <p className="section-copy">
                Review the structured data before matching it with a role.
              </p>
            </div>
            <div style={{ minWidth: "160px" }}>
              <button
                className="btn btn-download"
                onClick={() => downloadJson(resume, "parsed_resume.json")}
              >
                Download JSON
              </button>
            </div>
          </div>
          <ResumeProfile resume={resume} />
        </>
      )}

      <hr />
      <div className="section-title">Job description</div>
      <p className="section-copy">
        Paste the role requirements to compare them with the parsed resume.
      </p>
      <textarea
        rows={9}
        placeholder="Paste job description here..."
        value={jdText}
        onChange={(e) => setJdText(e.target.value)}
      />
      <div style={{ marginTop: "1rem", maxWidth: "320px" }}>
        <button className="btn btn-primary" onClick={handleMatch} disabled={isMatching}>
          {isMatching ? "Matching..." : "Match with job description"}
        </button>
      </div>

      {matchError && <div className="alert alert-error">{matchError}</div>}
      {matchSuccess && !matchError && (
        <div className="alert alert-success">Matching complete.</div>
      )}

      {matchResult && <MatchResult result={matchResult} />}
    </div>
  );
}
