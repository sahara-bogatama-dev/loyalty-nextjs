import { PrismaClient } from "@prisma/client";
import _ from "lodash";
import moment from "moment";

const prisma = new PrismaClient();

export async function listProduct() {
  try {
    return prisma.$transaction(async (tx) => {
      const currentDate = new Date();
      const productList = await tx.product.findMany({
        where: {
          campaignId: null,
          expiredPeriod: {
            gt: new Date(),
          },
        },
      });

      return productList;
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function currentProduct({ campaignId }: { campaignId: string }) {
  try {
    return prisma.$transaction(async (tx) => {
      const productList = await tx.product.findMany({
        where: { campaignId: campaignId },
      });

      return productList;
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export const listCampaignActive = () => {
  try {
    return prisma.$transaction(async (tx) => {
      const campaignActive = await tx.campaign.findMany({
        where: {
          inActive: false,
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
        },
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
      });

      return campaignActive;
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
};

export interface Campaigns {
  campaignId?: string;
  campaignName: string;
  startDate: string;
  endDate: string;
  productId: string[];
  loyaltyPoint: number;
  image: any;
  description: string;
  createdBy?: string;
  updatedBy?: any;
  oldProductId?: string[];
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

export async function searchCampaign({ findSearch }: { findSearch?: string }) {
  try {
    return prisma.$transaction(async (tx) => {
      const searchUser = await tx.campaign.findMany({
        where: {
          OR: [{ campaignName: { contains: findSearch } }],
        },
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
      });

      return searchUser;
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function disableCampaign({
  updatedBy,
  disable,
  idEdit,
}: {
  updatedBy?: string;
  idEdit?: string;
  disable?: boolean;
}) {
  try {
    return prisma.$transaction(async (tx) => {
      const updateCampaign = await tx.campaign.update({
        where: { campaignId: idEdit },
        data: { inActive: disable, updatedBy: updatedBy },
      });

      return updateCampaign;
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function deleteCampaign({ idEdit }: { idEdit?: string }) {
  try {
    return prisma.$transaction(async (tx) => {
      const updateCampaign = await tx.campaign.delete({
        where: { campaignId: idEdit },
      });

      return updateCampaign;
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function updateCampaign({
  campaignName,
  productId,
  oldProductId,
  startDate,
  endDate,
  image,
  loyaltyPoint,
  description,
  campaignId,
  updatedBy,
}: Campaigns) {
  try {
    return prisma.$transaction(async (tx) => {
      const updateCampaign = await tx.campaign.update({
        where: { campaignId },
        data: {
          campaignName,
          startDate,
          endDate,
          photo: image,
          loyaltyPoint,
          description,
          updatedBy,
        },
      });

      if (updateCampaign) {
        console.log(oldProductId);
        if (oldProductId) {
          await tx.product.updateMany({
            where: { productId: { in: oldProductId } },
            data: { campaignId: null, updatedBy },
          });
        }

        const setNewProductId = await tx.product.updateMany({
          where: { productId: { in: productId } },
          data: { campaignId: campaignId, updatedBy },
        });

        return setNewProductId;
      }
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}
