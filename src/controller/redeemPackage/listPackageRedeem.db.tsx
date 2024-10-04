import { PrismaClient } from "@prisma/client";
import _ from "lodash";

const prisma = new PrismaClient();

export async function listDataPackageRedeem() {
  try {
    const [result] = await prisma.$transaction([
      prisma.packageRedeem.findMany({
        orderBy: { createdAt: "asc" },
        select: {
          packageDesc: true,
          packageId: true,
          packageName: true,
          limit: true,
          costPoint: true,
          inActive: true,
          createdAt: true,
          createdBy: true,
          updatedAt: true,
          updatedBy: true,
        },
      }),
    ]);

    return { result };
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}
