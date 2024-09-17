import { PrismaClient } from "@prisma/client";
import _ from "lodash";

const prisma = new PrismaClient();

export function userDetail({ id }: { id: string }) {
  try {
    return prisma.$transaction(async (tx) => {
      const users = await tx.user.findUnique({
        where: { id },
        include: { role: true },
      });

      return users;
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}
