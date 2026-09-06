import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

/** Equivalent of load_resume_text_from_bytes + parse_resume in main.py */
export async function parseResume(file) {
  const formData = new FormData();
  formData.append("resume", file);
  const { data } = await api.post("/resume/parse", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data; // { resume, resumeId }
}

/** Equivalent of match_resume_to_jd in main.py */
export async function matchResumeToJD(resume, jdText, resumeId) {
  const { data } = await api.post("/resume/match", { resume, jdText, resumeId });
  return data; // JDMatchResult
}

export default api;
