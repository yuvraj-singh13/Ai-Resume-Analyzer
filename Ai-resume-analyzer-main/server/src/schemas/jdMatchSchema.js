import { z } from "zod";

export const JDMatchResultSchema = z.object({
  match_score: z.number().min(0).max(100),
  matched_skills: z.array(z.string()).default([]),
  missing_skills: z.array(z.string()).default([]),
  strengths: z.array(z.string()).default([]),
  gaps: z.array(z.string()).default([]),
  summary: z.string(),
});

export const JD_MATCH_JSON_SCHEMA = {
  name: "JDMatchResult",
  schema: {
    type: "object",
    properties: {
      match_score: { type: "number", minimum: 0, maximum: 100 },
      matched_skills: { type: "array", items: { type: "string" } },
      missing_skills: { type: "array", items: { type: "string" } },
      strengths: { type: "array", items: { type: "string" } },
      gaps: { type: "array", items: { type: "string" } },
      summary: { type: "string" },
    },
    required: [
      "match_score",
      "matched_skills",
      "missing_skills",
      "strengths",
      "gaps",
      "summary",
    ],
  },
};
