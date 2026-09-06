import { prisma } from "../config/prisma.js";

export async function getHealthStatus() {
  let database = "down";

  if (prisma) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      database = "up";
    } catch {
      database = "down";
    }
  }

  return {
    success: true,
    status: "ok",
    service: "kaushalsetu-api",
    timestamp: new Date().toISOString(),
    database,
  };
}
