import { z } from "zod";

/**
 * These Zod schemas are the direct equivalent of the Pydantic models
 * in the original Python project's models.py. They are used to validate
 * and coerce the JSON that the Groq LLM returns, the same role that
 * `llm.with_structured_output(Resume, method="json_schema", strict=True)`
 * played in the Python version.
 */

export const EducationSchema = z.object({
  university_name: z.string().nullable().default(null),
  degree: z.string().nullable().default(null),
  gpa: z.number().min(0).max(10).nullable().default(null),
});

export const ExperienceSchema = z.object({
  company_name: z.string().nullable().default(null),
  job_title: z.string().nullable().default(null),
  years: z.string().nullable().default(null),
  project_name: z.string().nullable().default(null),
  project_description: z.string().nullable().default(null),
  tech_stack: z.array(z.string()).nullable().default(null),
});

export const ProjectSchema = z.object({
  name: z.string().nullable().default(null),
  description: z.string().nullable().default(null),
  tech_stack: z.array(z.string()).default([]),
});

export const ResumeSchema = z.object({
  name: z.string().nullable().default(null),
  email: z.string().nullable().default(null),
  phone_number: z.string().nullable().default(null),
  education: z.array(EducationSchema).default([]),
  experience: z.array(ExperienceSchema).default([]),
  projects: z.array(ProjectSchema).default([]),
  skills: z.array(z.string()).default([]),
});

/**
 * JSON-Schema representation handed to the Groq model so it knows the
 * exact shape it must return (equivalent to the pydantic-generated
 * schema used by json_schema strict mode in parser.py).
 */
export const RESUME_JSON_SCHEMA = {
  name: "Resume",
  schema: {
    type: "object",
    properties: {
      name: { type: ["string", "null"] },
      email: { type: ["string", "null"] },
      phone_number: { type: ["string", "null"] },
      education: {
        type: "array",
        items: {
          type: "object",
          properties: {
            university_name: { type: ["string", "null"] },
            degree: { type: ["string", "null"] },
            gpa: { type: ["number", "null"], minimum: 0, maximum: 10 },
          },
          required: ["university_name", "degree", "gpa"],
        },
      },
      experience: {
        type: "array",
        items: {
          type: "object",
          properties: {
            company_name: { type: ["string", "null"] },
            job_title: { type: ["string", "null"] },
            years: { type: ["string", "null"] },
            project_name: { type: ["string", "null"] },
            project_description: { type: ["string", "null"] },
            tech_stack: { type: ["array", "null"], items: { type: "string" } },
          },
          required: [
            "company_name",
            "job_title",
            "years",
            "project_name",
            "project_description",
            "tech_stack",
          ],
        },
      },
      projects: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: ["string", "null"] },
            description: { type: ["string", "null"] },
            tech_stack: { type: "array", items: { type: "string" } },
          },
          required: ["name", "description", "tech_stack"],
        },
      },
      skills: { type: "array", items: { type: "string" } },
    },
    required: ["name", "email", "phone_number", "education", "experience", "projects", "skills"],
  },
};
