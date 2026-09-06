/**
 * Equivalent of skill_tags() in main.py. React escapes text content by
 * default (no dangerouslySetInnerHTML here), matching the original's
 * html.escape() call for every model-provided string.
 */
export default function SkillTags({ skills = [], missing = false }) {
  if (!skills || skills.length === 0) {
    return <span className="section-copy">None identified</span>;
  }

  return (
    <>
      {skills.map((skill, index) => (
        <span key={`${skill}-${index}`} className={missing ? "skill missing" : "skill"}>
          {String(skill)}
        </span>
      ))}
    </>
  );
}
