import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { APPLICATION_SEEDS } from "./applicationSeedData.js";
import { ASSESSMENTS } from "./assessmentSeedData.js";
import { FOCUSED_ASSESSMENTS } from "./careerAssessmentSeedData.js";
import { CAREER_ROLES } from "./careerRoleSeedData.js";
import { DEMO_INDUSTRY_PASSWORD, INDUSTRY_SEEDS } from "./opportunitySeedData.js";
import { DEMO_STUDENT_PASSWORD, STUDENT_SEEDS } from "./studentSeedData.js";

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
  { name: "OOP", category: "TECHNICAL" },
  { name: "Spring Boot", category: "TECHNICAL" },
  { name: "Django", category: "TECHNICAL" },
  { name: "Data Analysis", category: "TECHNICAL" },
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

async function seedAssessmentList(list) {
  const skills = await prisma.skill.findMany();
  const skillByName = new Map(skills.map((item) => [item.name, item]));

  for (const assessment of list) {
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

async function seedCareerRoles() {
  const skills = await prisma.skill.findMany();
  const skillByName = new Map(skills.map((item) => [item.name, item]));

  for (const role of CAREER_ROLES) {
    const record = await prisma.careerRole.upsert({
      where: { name: role.name },
      update: {
        description: role.description,
        isActive: true,
      },
      create: {
        name: role.name,
        description: role.description,
        isActive: true,
      },
    });

    await prisma.careerRoleSkill.deleteMany({
      where: { careerRoleId: record.id },
    });

    await prisma.careerRoleSkill.createMany({
      data: role.skills.map((item, index) => {
        const skill = skillByName.get(item.name);
        if (!skill) {
          throw new Error(`Unknown skill in career role seed: ${item.name}`);
        }
        return {
          careerRoleId: record.id,
          skillId: skill.id,
          requiredProficiency: item.requiredProficiency,
          isRequired: item.isRequired,
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

async function seedDemoStudents() {
  const skills = await prisma.skill.findMany();
  const skillByName = new Map(skills.map((item) => [item.name, item]));
  const passwordHash = await bcrypt.hash(DEMO_STUDENT_PASSWORD, 10);

  for (const entry of STUDENT_SEEDS) {
    let user = await prisma.user.findUnique({
      where: { email: entry.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: entry.name,
          email: entry.email,
          passwordHash,
          role: "STUDENT",
        },
      });
    }

    const profile = await prisma.studentProfile.upsert({
      where: { userId: user.id },
      update: entry.profile,
      create: {
        userId: user.id,
        ...entry.profile,
      },
    });

    for (const skill of entry.skills) {
      const catalog = skillByName.get(skill.name);
      if (!catalog) {
        throw new Error(`Unknown skill in student seed: ${skill.name}`);
      }
      await prisma.studentSkill.upsert({
        where: {
          studentProfileId_skillId: {
            studentProfileId: profile.id,
            skillId: catalog.id,
          },
        },
        update: { proficiency: skill.proficiency },
        create: {
          studentProfileId: profile.id,
          skillId: catalog.id,
          proficiency: skill.proficiency,
        },
      });
    }
  }
}

async function seedDemoApplications() {
  for (const entry of APPLICATION_SEEDS) {
    const student = await prisma.user.findUnique({
      where: { email: entry.studentEmail },
      include: { profile: true },
    });
    const industry = await prisma.user.findUnique({
      where: { email: entry.companyEmail },
      include: { company: true },
    });
    if (!student?.profile || !industry?.company) {
      throw new Error(`Missing seed identities for application ${entry.studentEmail} → ${entry.opportunityTitle}`);
    }

    const opportunity = await prisma.opportunity.findFirst({
      where: {
        companyProfileId: industry.company.id,
        title: entry.opportunityTitle,
      },
    });
    if (!opportunity) {
      throw new Error(`Missing seed opportunity ${entry.opportunityTitle}`);
    }

    await prisma.application.upsert({
      where: {
        studentProfileId_opportunityId: {
          studentProfileId: student.profile.id,
          opportunityId: opportunity.id,
        },
      },
      update: {
        status: entry.status,
        coverLetter: entry.coverLetter,
        appliedAt: new Date(entry.appliedAt),
      },
      create: {
        studentProfileId: student.profile.id,
        opportunityId: opportunity.id,
        status: entry.status,
        coverLetter: entry.coverLetter,
        appliedAt: new Date(entry.appliedAt),
      },
    });
  }
}

async function main() {
  await seedSkills();
  await seedAssessmentList(ASSESSMENTS);
  await seedAssessmentList(FOCUSED_ASSESSMENTS);
  await seedCareerRoles();
  await seedIndustryOpportunities();
  await seedDemoStudents();
  await seedDemoApplications();
  console.log(
    `Seeded ${SKILLS.length} skills, ${ASSESSMENTS.length + FOCUSED_ASSESSMENTS.length} assessments, ${CAREER_ROLES.length} career roles, ${INDUSTRY_SEEDS.length} industry accounts, ${STUDENT_SEEDS.length} demo students, and ${APPLICATION_SEEDS.length} demo applications`,
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
