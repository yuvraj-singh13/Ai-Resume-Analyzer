import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * Field-for-field mirror of the Python Pydantic models in models.py:
 * Education, Experience, Project, Resume.
 */
const EducationSchema = new Schema(
  {
    university_name: { type: String, default: null },
    degree: { type: String, default: null },
    gpa: { type: Number, min: 0, max: 10, default: null },
  },
  { _id: false }
);

const ExperienceSchema = new Schema(
  {
    company_name: { type: String, default: null },
    job_title: { type: String, default: null },
    years: { type: String, default: null },
    project_name: { type: String, default: null },
    project_description: { type: String, default: null },
    tech_stack: { type: [String], default: null },
  },
  { _id: false }
);

const ProjectSchema = new Schema(
  {
    name: { type: String, default: null },
    description: { type: String, default: null },
    tech_stack: { type: [String], default: [] },
  },
  { _id: false }
);

const ResumeSchema = new Schema(
  {
    name: { type: String, default: null },
    email: { type: String, default: null },
    phone_number: { type: String, default: null },
    education: { type: [EducationSchema], default: [] },
    experience: { type: [ExperienceSchema], default: [] },
    projects: { type: [ProjectSchema], default: [] },
    skills: { type: [String], default: [] },
    sourceFileName: { type: String, default: null },
  },
  { timestamps: true }
);

export const Resume = mongoose.model("Resume", ResumeSchema);
export default Resume;
