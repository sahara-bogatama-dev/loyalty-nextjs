import { PrismaClient } from "@prisma/client";
import _ from "lodash";

const prisma = new PrismaClient();

export interface PackageRedeems {
  packageId?: string;
  packageName?: string;
  costPoint?: number;
  limit?: number;
  image?: any;
  description?: string;
  inActive?: boolean;
  createdBy?: string;
  updatedBy?: string;
}

export async function addPackage({
  packageName,
  costPoint,
  limit,
  image,
  description,
  createdBy,
}: PackageRedeems) {
  try {
    return prisma.$transaction(async (tx) => {
      const addPackage = await tx.packageRedeem.create({
        data: {
          packageName,
          costPoint: costPoint ?? 0,
          limit,
          photo: image,
          packageDesc: description,
          createdBy,
        },
      });

      return { addPackage };
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function packageImage({ packageId }: { packageId: string }) {
  try {
    const [result] = await prisma.$transaction([
      prisma.packageRedeem.findUnique({ where: { packageId } }),
    ]);

    return result;
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function deletePackageRedeem({
  packageId,
}: {
  packageId?: string;
}) {
  try {
    return prisma.$transaction(async (tx) => {
      const deleteData = await tx.packageRedeem.delete({
        where: { packageId },
      });

      return deleteData;
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function updatePackageRedeem({
  packageId,
  packageName,
  costPoint,
  limit,
  description,
  inActive,
  updatedBy,
}: PackageRedeems) {
  try {
    return prisma.$transaction(async (tx) => {
      const updateData: any = {};
      if (packageName) updateData.packageName = packageName;
      if (costPoint) updateData.costPoint = costPoint;
      if (limit) updateData.limit = limit;
      if (description) updateData.description = description;
      if (inActive !== undefined) updateData.inActive = inActive;

      updateData.updatedBy = updatedBy;

      const updateCampaign = await tx.packageRedeem.update({
        where: { packageId },
        data: updateData,
      });

      return updateCampaign;
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function updatePackageImage({
  image,
  packageId,
  updatedBy,
}: PackageRedeems) {
  try {
    return prisma.$transaction(async (tx) => {
      const updateCampaign = await tx.packageRedeem.update({
        where: { packageId },
        data: { photo: image, updatedBy },
      });

      return updateCampaign;
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}
