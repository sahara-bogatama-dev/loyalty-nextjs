import { PrismaClient } from "@prisma/client";
import _ from "lodash";

const prisma = new PrismaClient();

export async function listAgent() {
  try {
    const [result] = await prisma.$transaction([
      prisma.agent.findMany({
        orderBy: { createdAt: "asc" },
      }),
    ]);

    return { result };
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}
