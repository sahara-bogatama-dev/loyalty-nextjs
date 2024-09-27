import { PrismaClient } from "@prisma/client";
import _ from "lodash";

const prisma = new PrismaClient();

export async function paginationListOwner({
  skip,
  take,
}: {
  skip: number;
  take: number;
}) {
  try {
    const [result, count] = await prisma.$transaction([
      prisma.boothOwner.findMany({
        skip,
        take,
        orderBy: { createdAt: "asc" },
        include: {
          _count: {
            select: { boothMember: true },
          },
        },
      }),
      prisma.boothOwner.count(),
    ]);

    return { result, count };
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function listMember({
  skip,
  take,
}: {
  skip: number;
  take: number;
}) {
  try {
    const [result, count] = await prisma.$transaction([
      prisma.booth.findMany({
        skip,
        take,
        orderBy: { createdAt: "asc" },
      }),
      prisma.boothOwner.count(),
    ]);

    return { result, count };
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}
