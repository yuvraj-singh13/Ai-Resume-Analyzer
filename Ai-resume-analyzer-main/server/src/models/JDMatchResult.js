import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * Mirrors the Python JDMatchResult Pydantic model in models.py.
 */
const JDMatchResultSchema = new Schema(
  {
    resume: { type: Schema.Types.ObjectId, ref: "Resume", default: null },
    jd_text: { type: String, required: true },
    match_score: { type: Number, min: 0, max: 100, required: true },
    matched_skills: { type: [String], default: [] },
    missing_skills: { type: [String], default: [] },
    strengths: { type: [String], default: [] },
    gaps: { type: [String], default: [] },
    summary: { type: String, required: true },
  },
  { timestamps: true }
);

export const JDMatchResult = mongoose.model("JDMatchResult", JDMatchResultSchema);
export default JDMatchResult;
