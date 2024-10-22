import { PrismaClient } from "@prisma/client";
import _ from "lodash";

const prisma = new PrismaClient();

export async function listDataPackageRedeem() {
  try {
    const [result] = await prisma.$transaction([
      prisma.packageRedeem.findMany({
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
    ]);

    return { result };
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function listDataPackageRedeemByUserId({
  userId,
}: {
  userId: string;
}) {
  try {
    return prisma.$transaction(async (tx) => {
      const findPointUser = await tx.pointLoyalty.findFirst({
        where: { userId },
        select: { point: true },
      });

      const findPackageId = await tx.redeem.findMany({
        where: { userId },
      });

      const listPackage = await tx.packageRedeem.findMany({
        where: { inActive: false },
      });

      return _.map(listPackage, (o) => {
        const currentLimit = findPackageId?.filter(
          (redeemItem) => redeemItem.packageId === o.packageId
        ).length;
        const userPoints = findPointUser?.point ?? 0;
        const isActive = userPoints >= o.costPoint;

        return {
          packageId: o.packageId,
          packageName: o.packageName,
          description: o.packageDesc,
          cost: o.costPoint,
          limit: o.limit,
          photo: `https://sahara-app.vercel.app/api/package-redeem/image/${o.packageId}`,
          currentLimit: currentLimit,
          active: isActive,
        };
      });
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}
