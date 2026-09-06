import SkillTags from "./SkillTags.jsx";

/**
 * Equivalent of render_resume_profile() in main.py: displays the extracted
 * resume data as readable sections instead of raw JSON.
 */
export default function ResumeProfile({ resume }) {
  const contactValues = [resume.email, resume.phone_number].filter(Boolean);

  return (
    <>
      <div className="profile-card">
        <div className="profile-name">{resume.name || "Resume"}</div>
        <div className="profile-contact">
          {contactValues.map((value, i) => (
            <span key={i}>{value}</span>
          ))}
        </div>
      </div>

      {resume.skills && resume.skills.length > 0 && (
        <div className="result-card" style={{ marginTop: "1rem" }}>
          <h3>Skills</h3>
          <SkillTags skills={resume.skills} />
        </div>
      )}

      <div className="two-col" style={{ marginTop: "1rem" }}>
        <div className="result-card">
          <h3>Education</h3>
          {resume.education && resume.education.length > 0 ? (
            resume.education.map((item, i) => (
              <div className="timeline-item" key={i}>
                <div className="timeline-title">{item.degree || "Education"}</div>
                <div className="timeline-meta">
                  {item.university_name || ""}
                  {item.gpa != null ? ` \u00b7 GPA ${item.gpa}` : ""}
                </div>
              </div>
            ))
          ) : (
            <p className="section-copy">No education details extracted.</p>
          )}
        </div>

        <div className="result-card">
          <h3>Experience</h3>
          {resume.experience && resume.experience.length > 0 ? (
            resume.experience.map((item, i) => (
              <div className="timeline-item" key={i}>
                <div className="timeline-title">
                  {item.job_title || item.company_name || "Experience"}
                </div>
                <div className="timeline-meta">
                  {item.company_name || ""}
                  {item.years ? ` \u00b7 ${item.years}` : ""}
                </div>
                {item.project_name && (
                  <div className="timeline-copy">{item.project_name}</div>
                )}
                {item.project_description && (
                  <div className="timeline-copy">{item.project_description}</div>
                )}
                {item.tech_stack && item.tech_stack.length > 0 && (
                  <div className="timeline-copy">
                    <SkillTags skills={item.tech_stack} />
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="section-copy">No experience details extracted.</p>
          )}
        </div>
      </div>

      {resume.projects && resume.projects.length > 0 && (
        <div className="result-card" style={{ marginTop: "1rem" }}>
          <h3>Projects</h3>
          {resume.projects.map((project, i) => (
            <div className="timeline-item" key={i}>
              <div className="timeline-title">{project.name || "Project"}</div>
              {project.description && (
                <div className="timeline-copy">{project.description}</div>
              )}
              {project.tech_stack && project.tech_stack.length > 0 && (
                <div className="timeline-copy">
                  <SkillTags skills={project.tech_stack} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
