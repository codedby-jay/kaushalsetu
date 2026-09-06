import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { ASSESSMENTS } from "./assessmentSeedData.js";
import { DEMO_INDUSTRY_PASSWORD, INDUSTRY_SEEDS } from "./opportunitySeedData.js";

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
  { name: "Linux", category: "TECHNICAL" },
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

function deadlineFrom(value) {
  if (!value) {
    return null;
  }
  return new Date(`${value}T00:00:00.000Z`);
}

async function seedIndustryOpportunities() {
  const skills = await prisma.skill.findMany();
  const skillByName = new Map(skills.map((item) => [item.name, item]));
  const passwordHash = await bcrypt.hash(DEMO_INDUSTRY_PASSWORD, 10);

  for (const entry of INDUSTRY_SEEDS) {
    let user = await prisma.user.findUnique({
      where: { email: entry.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: entry.name,
          email: entry.email,
          passwordHash,
          role: "INDUSTRY",
        },
      });
    }

    const company = await prisma.companyProfile.upsert({
      where: { userId: user.id },
      update: entry.company,
      create: {
        userId: user.id,
        ...entry.company,
      },
    });

    for (const item of entry.opportunities) {
      const skillRows = item.skills.map((skill) => {
        const catalog = skillByName.get(skill.name);
        if (!catalog) {
          throw new Error(`Unknown skill in opportunity seed: ${skill.name}`);
        }
        return {
          skillId: catalog.id,
          requiredProficiency: skill.requiredProficiency,
          isRequired: skill.isRequired,
        };
      });

      const existing = await prisma.opportunity.findFirst({
        where: {
          companyProfileId: company.id,
          title: item.title,
        },
      });

      const baseData = {
        title: item.title,
        description: item.description,
        type: item.type,
        location: item.location,
        workMode: item.workMode,
        duration: item.duration ?? null,
        stipend: item.stipend ?? null,
        salaryMin: item.salaryMin ?? null,
        salaryMax: item.salaryMax ?? null,
        applicationDeadline: deadlineFrom(item.applicationDeadline),
        status: item.status,
        publishedAt: item.status === "PUBLISHED" ? new Date("2026-09-01T00:00:00.000Z") : null,
      };

      const opportunity = existing
        ? await prisma.opportunity.update({
            where: { id: existing.id },
            data: baseData,
          })
        : await prisma.opportunity.create({
            data: {
              ...baseData,
              companyProfileId: company.id,
            },
          });

      await prisma.opportunitySkill.deleteMany({
        where: { opportunityId: opportunity.id },
      });
      await prisma.opportunitySkill.createMany({
        data: skillRows.map((row) => ({
          opportunityId: opportunity.id,
          ...row,
        })),
      });
    }
  }
}

async function main() {
  await seedSkills();
  await seedAssessments();
  await seedIndustryOpportunities();
  console.log(
    `Seeded ${SKILLS.length} skills, ${ASSESSMENTS.length} assessments, and ${INDUSTRY_SEEDS.length} industry accounts`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
