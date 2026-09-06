import { callGroqStructured } from "./groqClient.js";
import { JD_MATCH_SYSTEM_PROMPT, buildJDMatchUserPrompt } from "../prompts/prompts.js";
import { JDMatchResultSchema, JD_MATCH_JSON_SCHEMA } from "../schemas/jdMatchSchema.js";

/**
 * Equivalent of match_resume_to_jd() in matcher.py.
 * `resume` is the plain structured resume object (already validated by
 * resumeParser.js), matching resume.model_dump_json(indent=2) in Python.
 */
export async function matchResumeToJD(resume, jdText) {
  const resumeJson = JSON.stringify(resume, null, 2);

  const raw = await callGroqStructured({
    systemPrompt: JD_MATCH_SYSTEM_PROMPT,
    userPrompt: buildJDMatchUserPrompt(jdText, resumeJson),
    jsonSchema: JD_MATCH_JSON_SCHEMA,
  });

  let parsedJson;
  try {
    parsedJson = JSON.parse(raw);
  } catch (error) {
    throw new Error(`LLM did not return valid JSON for the match result: ${error.message}`);
  }

  const result = JDMatchResultSchema.safeParse(parsedJson);
  if (!result.success) {
    throw new Error(`Match result failed schema validation: ${result.error.message}`);
  }

  return result.data;
}
