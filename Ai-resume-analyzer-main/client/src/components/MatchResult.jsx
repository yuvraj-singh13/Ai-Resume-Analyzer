import SkillTags from "./SkillTags.jsx";

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
 * Port of the "Match result" rendering block at the bottom of main.py.
 */
export default function MatchResult({ result }) {
  return (
    <>
      <hr />
      <div className="section-title">Match result</div>

      <div className="metrics-row">
        <div className="metric">
          <div className="metric-label">Match score</div>
          <div className="metric-value">{result.match_score.toFixed(1)}%</div>
        </div>
        <div className="metric">
          <div className="metric-label">Missing skills</div>
          <div className="metric-value">{result.missing_skills.length}</div>
        </div>
      </div>

      <div className="result-grid" style={{ marginTop: "1rem" }}>
        <div className="result-card">
          <h3>Matched skills</h3>
          <SkillTags skills={result.matched_skills} />
        </div>
        <div className="result-card">
          <h3>Missing skills</h3>
          <SkillTags skills={result.missing_skills} missing />
        </div>
      </div>

      <div className="result-grid" style={{ marginTop: "1rem" }}>
        <div className="result-card">
          <h3>Strengths</h3>
          <SkillTags skills={result.strengths} />
        </div>
        <div className="result-card">
          <h3>Gaps</h3>
          <SkillTags skills={result.gaps} missing />
        </div>
      </div>

      <div className="result-card" style={{ marginTop: "1rem" }}>
        <h3>Recruiter summary</h3>
        <p>{result.summary}</p>
      </div>

      <div style={{ marginTop: "1rem", maxWidth: "260px" }}>
        <button
          className="btn btn-download"
          onClick={() => downloadJson(result, "jd_match_result.json")}
        >
          Download match result
        </button>
      </div>
    </>
  );
}
