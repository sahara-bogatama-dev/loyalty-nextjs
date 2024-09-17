import { PrismaClient } from "@prisma/client";
import _ from "lodash";
import moment from "moment";

const prisma = new PrismaClient();

export async function listProduct() {
  try {
    return prisma.$transaction(async (tx) => {
      const productList = await tx.product.findMany({
        where: { campaignId: null },
      });

      return productList;
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

interface Campaigns {
  campaignName: string;
  startDate: string;
  endDate: string;
  productId: string[];
  loyaltyPoint: number;
  image: any;
  description: string;
  createdBy: string;
}

export async function addCampaign({
  campaignName,
  startDate,
  endDate,
  productId,
  loyaltyPoint,
  image,
  description,
  createdBy,
}: Campaigns) {
  try {
    return prisma.$transaction(async (tx) => {
      const addCampaign = await tx.campaign.create({
        data: {
          campaignName,
          startDate,
          endDate,
          loyaltyPoint,
          photo: image,
          description,
          createdBy,
        },
      });

      if (addCampaign) {
        const updateProduct = await tx.product.updateMany({
          where: { productId: { in: productId } },
          data: {
            campaignId: addCampaign.campaignId,
            updatedBy: createdBy,
          },
        });

        return { updateProduct };
      }
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function campaignImage({ campaignId }: { campaignId: string }) {
  try {
    const [result] = await prisma.$transaction([
      prisma.campaign.findUnique({ where: { campaignId } }),
    ]);

    return result;
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}
