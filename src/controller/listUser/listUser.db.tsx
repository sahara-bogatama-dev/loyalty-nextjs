import { PrismaClient } from "@prisma/client";
import _ from "lodash";

const prisma = new PrismaClient();

export async function paginationListUser({
  skip,
  take,
}: {
  skip: number;
  take: number;
}) {
  try {
    const [result, count] = await prisma.$transaction([
      prisma.user.findMany({
        where: { NOT: { email: "sahara@super1.com" } },
        skip,
        take,
        select: {
          id: true,
          name: true,
          phone: true,
          dateOfBirth: true,
          email: true,
          inActive: true,
          createdBy: true,
          updatedBy: true,
          createdAt: true,
          updatedAt: true,
          leader: true,
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { name: "asc" },
      }),
      prisma.user.count(),
    ]);

    return { result, count };
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}
