import { PrismaClient } from "@prisma/client";
import { ASSESSMENTS } from "./assessmentSeedData.js";

const prisma = new PrismaClient();

const SKILLS = [
  { name: "JavaScript", category: "TECHNICAL" },
  { name: "React", category: "TECHNICAL" },
  { name: "Node.js", category: "TECHNICAL" },
  { name: "Express", category: "TECHNICAL" },
  { name: "Java", category: "TECHNICAL" },
  { name: "Python", category: "TECHNICAL" },
  { name: "C++", category: "TECHNICAL" },
  { name: "SQL", category: "TECHNICAL" },
  { name: "PostgreSQL", category: "TECHNICAL" },
  { name: "MongoDB", category: "TECHNICAL" },
  { name: "HTML", category: "TECHNICAL" },
  { name: "CSS", category: "TECHNICAL" },
  { name: "Tailwind CSS", category: "TECHNICAL" },
  { name: "Git", category: "TECHNICAL" },
  { name: "REST APIs", category: "TECHNICAL" },
  { name: "Data Structures", category: "TECHNICAL" },
  { name: "Algorithms", category: "TECHNICAL" },
  { name: "DSA", category: "TECHNICAL" },
  { name: "Docker", category: "TECHNICAL" },
  { name: "Communication", category: "SOFT" },
  { name: "Leadership", category: "SOFT" },
  { name: "Teamwork", category: "SOFT" },
  { name: "Problem Solving", category: "SOFT" },
  { name: "Time Management", category: "SOFT" },
  { name: "Presentation", category: "SOFT" },
  { name: "Critical Thinking", category: "SOFT" },
];

async function seedSkills() {
  for (const skill of SKILLS) {
    await prisma.skill.upsert({
      where: { name: skill.name },
      update: { category: skill.category },
      create: skill,
    });
  }
}

async function seedAssessments() {
  const skills = await prisma.skill.findMany();
  const skillByName = new Map(skills.map((item) => [item.name, item]));

  for (const assessment of ASSESSMENTS) {
    const record = await prisma.assessment.upsert({
      where: { title: assessment.title },
      update: {
        description: assessment.description,
        isActive: true,
      },
      create: {
        title: assessment.title,
        description: assessment.description,
        isActive: true,
      },
    });

    const existingCount = await prisma.assessmentQuestion.count({
      where: { assessmentId: record.id },
    });
    if (existingCount > 0) {
      continue;
    }

    await prisma.assessmentQuestion.createMany({
      data: assessment.questions.map((question, index) => {
        const skill = skillByName.get(question.skill);
        if (!skill) {
          throw new Error(`Unknown skill in seed: ${question.skill}`);
        }
        return {
          assessmentId: record.id,
          skillId: skill.id,
          questionText: question.questionText,
          options: question.options,
          correctIndex: question.correctIndex,
          difficulty: question.difficulty,
          points: 1,
          sortOrder: index + 1,
        };
      }),
    });
  }
}

async function main() {
  await seedSkills();
  await seedAssessments();
  console.log(`Seeded ${SKILLS.length} skills and ${ASSESSMENTS.length} assessments`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
