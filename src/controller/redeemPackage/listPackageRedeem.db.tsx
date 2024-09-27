import { PrismaClient } from "@prisma/client";
import _ from "lodash";

const prisma = new PrismaClient();

export async function paginationListPackageRedeem({
  skip,
  take,
}: {
  skip: number;
  take: number;
}) {
  try {
    const [result, count] = await prisma.$transaction([
      prisma.packageRedeem.findMany({
        skip,
        take,
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
      prisma.packageRedeem.count(),
    ]);

    return { result, count };
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}
