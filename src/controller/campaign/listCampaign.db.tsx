import { PrismaClient } from "@prisma/client";
import _ from "lodash";

const prisma = new PrismaClient();

export async function listDataCampaign() {
  try {
    const [result] = await prisma.$transaction([
      prisma.campaign.findMany({
        orderBy: { createdAt: "asc" },
        select: {
          campaignId: true,
          campaignName: true,
          loyaltyPoint: true,
          description: true,
          startDate: true,
          endDate: true,
          createdAt: true,
          createdBy: true,
          updatedAt: true,
          updatedBy: true,
          inActive: true,
        },
      }),
    ]);

    return { result };
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}
