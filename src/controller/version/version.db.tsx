import { PrismaClient } from "@prisma/client";
import _ from "lodash";

const prisma = new PrismaClient();

export function versionApps() {
  try {
    return prisma.$transaction(async (tx) => {
      const data = await tx.versionMobile.findFirst();

      return data;
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}
