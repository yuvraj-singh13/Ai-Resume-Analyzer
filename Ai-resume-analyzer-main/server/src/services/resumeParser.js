import { callGroqStructured } from "./groqClient.js";
import { RESUME_SYSTEM_PROMPT, buildResumeUserPrompt } from "../prompts/prompts.js";
import { ResumeSchema, RESUME_JSON_SCHEMA } from "../schemas/resumeSchema.js";
import { loadResumeTextFromBuffer } from "../utils/fileText.js";

/**
 * Equivalent of parse_resume() in parser.py: sends the resume text to the
 * Groq LLM constrained to the Resume JSON schema, then validates/coerces
 * the result the same way `structured_llm` + Pydantic did.
 */
export async function parseResume(resumeText) {
  const raw = await callGroqStructured({
    systemPrompt: RESUME_SYSTEM_PROMPT,
    userPrompt: buildResumeUserPrompt(resumeText),
    jsonSchema: RESUME_JSON_SCHEMA,
  });

  let parsedJson;
  try {
    parsedJson = JSON.parse(raw);
  } catch (error) {
    throw new Error(`LLM did not return valid JSON for the resume: ${error.message}`);
  }

  const result = ResumeSchema.safeParse(parsedJson);
  if (!result.success) {
    throw new Error(`Resume output failed schema validation: ${result.error.message}`);
  }

  return result.data;
}

/**
 * Equivalent of parse_resume_from_path(): extracts text from an uploaded
 * PDF/DOCX buffer, then parses it into a structured Resume.
 */
export async function parseResumeFromBuffer(fileBuffer, originalName) {
  const text = await loadResumeTextFromBuffer(fileBuffer, originalName);
  return parseResume(text);
}
