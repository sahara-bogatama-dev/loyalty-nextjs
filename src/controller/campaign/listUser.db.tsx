import { PrismaClient } from "@prisma/client";
import _ from "lodash";

const prisma = new PrismaClient();

export async function paginationListCampaign({
  skip,
  take,
}: {
  skip: number;
  take: number;
}) {
  try {
    const [result, count] = await prisma.$transaction([
      prisma.campaign.findMany({
        skip,
        take,
        orderBy: { createdAt: "asc" },
      }),
      prisma.campaign.count(),
    ]);

    return { result, count };
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}
