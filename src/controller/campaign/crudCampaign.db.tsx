import { PrismaClient } from "@prisma/client";
import _ from "lodash";

const prisma = new PrismaClient();

export async function listProduct() {
  try {
    return prisma.$transaction(async (tx) => {
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
  campaignName?: string;
  startDate?: string;
  endDate?: string;
  productId?: string[];
  loyaltyPoint?: number;
  image?: any;
  description?: string;
  createdBy?: string;
  updatedBy?: any;
  inActive?: boolean;
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
          campaignName: campaignName ?? "",
          startDate: startDate ?? new Date(),
          endDate: endDate ?? new Date(),
          loyaltyPoint: loyaltyPoint ?? 0,
          photo: image,
          description: description ?? "",
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

export async function disableCampaign({
  updatedBy,
  disable,
  campaignId,
}: {
  updatedBy?: string;
  campaignId?: string;
  disable?: boolean;
}) {
  try {
    return prisma.$transaction(async (tx) => {
      const updateCampaign = await tx.campaign.update({
        where: { campaignId },
        data: { inActive: disable, updatedBy: updatedBy },
      });

      return updateCampaign;
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function deleteCampaign({ campaignId }: { campaignId?: string }) {
  try {
    return prisma.$transaction(async (tx) => {
      const deletes = await tx.campaign.delete({
        where: { campaignId },
      });

      return deletes;
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function updateCampaign({
  campaignName,
  startDate,
  endDate,
  loyaltyPoint,
  description,
  campaignId,
  updatedBy,
  inActive,
}: Campaigns) {
  try {
    return prisma.$transaction(async (tx) => {
      const updateData: any = {};
      if (campaignName) updateData.campaignName = campaignName;
      if (startDate) updateData.startDate = startDate;
      if (endDate) updateData.endDate = endDate;
      if (loyaltyPoint) updateData.loyaltyPoint = loyaltyPoint;
      if (description) updateData.description = description;
      if (inActive !== undefined) updateData.inActive = inActive;

      updateData.updatedBy = updatedBy;

      const updateCampaign = await tx.campaign.update({
        where: { campaignId },
        data: updateData,
      });

      return updateCampaign;
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function updateCampaignProduct({
  oldProductId,
  productId,
  campaignId,
  updatedBy,
}: Campaigns) {
  try {
    return prisma.$transaction(async (tx) => {
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
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function updateCampaignImage({
  image,
  campaignId,
  updatedBy,
}: Campaigns) {
  try {
    return prisma.$transaction(async (tx) => {
      const updateCampaign = await tx.campaign.update({
        where: { campaignId },
        data: { photo: image, updatedBy },
      });

      return updateCampaign;
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}
