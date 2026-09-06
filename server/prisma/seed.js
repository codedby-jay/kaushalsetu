import { PrismaClient } from "@prisma/client";

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
  { name: "Docker", category: "TECHNICAL" },
  { name: "Communication", category: "SOFT" },
  { name: "Leadership", category: "SOFT" },
  { name: "Teamwork", category: "SOFT" },
  { name: "Problem Solving", category: "SOFT" },
  { name: "Time Management", category: "SOFT" },
  { name: "Presentation", category: "SOFT" },
  { name: "Critical Thinking", category: "SOFT" },
];

async function main() {
  for (const skill of SKILLS) {
    await prisma.skill.upsert({
      where: { name: skill.name },
      update: { category: skill.category },
      create: skill,
    });
  }

  console.log(`Seeded ${SKILLS.length} skills`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
