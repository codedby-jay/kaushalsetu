export function serializeProfile(profile) {
  if (!profile) {
    return null;
  }

  return {
    id: profile.id,
    headline: profile.headline,
    bio: profile.bio,
    phone: profile.phone,
    location: profile.location,
    education: profile.education,
    college: profile.college,
    degree: profile.degree,
    graduationYear: profile.graduationYear,
    githubUrl: profile.githubUrl,
    linkedinUrl: profile.linkedinUrl,
    portfolioUrl: profile.portfolioUrl,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}

export function serializeStudentSkill(record) {
  return {
    id: record.id,
    skillId: record.skillId,
    name: record.skill.name,
    category: record.skill.category,
    proficiency: record.proficiency,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export function summarizeSkills(records) {
  const technical = records.filter((item) => item.skill.category === "TECHNICAL");
  const soft = records.filter((item) => item.skill.category === "SOFT");
  const total = records.length;
  const averageProficiency =
    total === 0
      ? 0
      : Math.round(
          (records.reduce((sum, item) => sum + item.proficiency, 0) / total) * 10,
        ) / 10;

  return {
    total,
    technical: technical.length,
    soft: soft.length,
    averageProficiency,
  };
}
