import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export function runningNumber() {
  try {
    return prisma.$transaction(async (tx) => {
      const runningNumber = await tx.runningNumber.findMany();

      return runningNumber[0];
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}
