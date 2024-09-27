import { PrismaClient } from "@prisma/client";
import _ from "lodash";

const prisma = new PrismaClient();

export interface PackageRedeems {
  packageId?: string;
  packageName: string;
  costPoint: number;
  limit: number;
  image?: any;
  description: string;
  createdBy?: string;
  updatedBy?: any;
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
          costPoint,
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

export async function searchPackage({ findSearch }: { findSearch?: string }) {
  try {
    return prisma.$transaction(async (tx) => {
      const search = await tx.packageRedeem.findMany({
        where: {
          OR: [{ packageName: { contains: findSearch } }],
        },
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
      });

      return search;
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function disablePackage({
  updatedBy,
  disable,
  packageId,
}: {
  updatedBy?: string;
  packageId?: string;
  disable?: boolean;
}) {
  try {
    return prisma.$transaction(async (tx) => {
      const update = await tx.packageRedeem.update({
        where: { packageId },
        data: { inActive: disable, updatedBy: updatedBy },
      });

      return update;
    });
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
  image,
  description,
  updatedBy,
}: PackageRedeems) {
  try {
    return prisma.$transaction(async (tx) => {
      const updateData = await tx.packageRedeem.update({
        where: { packageId },
        data: {
          packageName,
          costPoint,
          limit,
          photo: image,
          packageDesc: description,
          updatedBy,
        },
      });

      return updateData;
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}
