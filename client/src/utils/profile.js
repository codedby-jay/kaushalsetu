const PROFILE_FIELDS = [
  "headline",
  "bio",
  "phone",
  "location",
  "college",
  "degree",
  "graduationYear",
  "githubUrl",
  "linkedinUrl",
  "portfolioUrl",
];

export function getProfileCompletion(profile, skillCount = 0) {
  const total = PROFILE_FIELDS.length + 1;
  let completed = 0;

  if (profile) {
    for (const field of PROFILE_FIELDS) {
      const value = profile[field];
      if (value !== null && value !== undefined && String(value).trim() !== "") {
        completed += 1;
      }
    }
  }

  if (skillCount > 0) {
    completed += 1;
  }

  return Math.round((completed / total) * 100);
}

export function proficiencyLabel(value) {
  const n = Number(value);
  if (n <= 0) return "No experience";
  if (n <= 2) return "Beginner";
  if (n <= 4) return "Basic";
  if (n <= 6) return "Intermediate";
  if (n <= 8) return "Advanced";
  if (n === 9) return "Expert";
  return "Highly proficient";
}
