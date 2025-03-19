import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";
import _ from "lodash";

const prisma = new PrismaClient();

export interface Point {
  pointId?: string;
  createdBy?: string;
  updatedBy?: string;
  point?: number;
  userId?: string;
  labelingProduct?: string;
  scanDate?: string;
}

export async function pinaltyPoint({ pointId, point, updatedBy }: Point) {
  try {
    return prisma.$transaction(async (tx) => {
      const update = await tx.pointLoyalty.update({
        where: { pointId },
        data: {
          point: { decrement: point },
          updatedBy,
        },
      });

      if (update) {
        await tx.pointReceiveLog.create({
          data: {
            pointId: pointId,
            point: point ?? 0,
            createdBy: updatedBy,
            userId: update.userId,
            status: 2,
          },
        });

        if (update.point < 0) {
          const defaultPoint = await tx.pointLoyalty.update({
            where: { pointId },
            data: {
              point: 0,
            },
          });

          return defaultPoint;
        }

        return update;
      } else {
        throw new Error(`Penalty point gagal di berikan...`);
      }
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function addPoint({
  userId,
  createdBy,
  labelingProduct,
  scanDate,
}: Point) {
  try {
    return prisma.$transaction(async (tx) => {
      const checkProductLabeling = await tx.labelingProduct.findFirst({
        where: { codeLabel: labelingProduct },
      });

      if (checkProductLabeling) {
        const checkStatus = await tx.stokopname.findFirst({
          where: {
            labelingProductId: checkProductLabeling?.labelingProductId,
            status: 11,
          },
        });

        if (!checkStatus) {
          throw new Error("Product belum terjual...");
        }

        const checkDuplicateAnotherScan = await tx.pointReceiveLog.findMany({
          where: { labelingProductId: checkProductLabeling.labelingProductId },
        });

        if (_.isEmpty(checkDuplicateAnotherScan)) {
          let point = 0;

          const getPoint = await tx.product.findFirst({
            where: { productId: checkProductLabeling.productId },
            include: {
              campaign: {
                where: {
                  inActive: false,
                  startDate: { lte: new Date() },
                  endDate: { gte: new Date() },
                },
                select: {
                  loyaltyPoint: true,
                },
              },
            },
          });

          if (getPoint) {
            point = getPoint.campaignId
              ? getPoint.campaign?.loyaltyPoint ?? getPoint.basePoint
              : getPoint.basePoint ?? 0;
          }

          const checkExistPoint = await tx.pointLoyalty.findFirst({
            where: { userId },
          });

          if (checkExistPoint) {
            const update = await tx.pointLoyalty.update({
              where: { pointId: checkExistPoint.pointId },
              data: {
                point: { increment: point },
                updatedBy: createdBy,
                log: {
                  create: {
                    point: point,
                    createdBy,
                    userId: userId ?? "",
                    status: 1,
                    productCode: checkProductLabeling.productCode,
                    productId: checkProductLabeling.productId,
                    productName: checkProductLabeling.productName,
                    labelingProductId: checkProductLabeling.labelingProductId,
                    labelingProducts: checkProductLabeling.codeLabel,
                    scanDate,
                    campaignId: getPoint?.campaignId,
                  },
                },
              },
            });

            if (update) {
              return update.point;
            } else {
              throw new Error(`Point gagal di berikan...`);
            }
          } else {
            const newAdd = await tx.pointLoyalty.create({
              data: {
                point: point,
                userId: userId ?? "",
                createdBy: createdBy,
                log: {
                  create: {
                    point: point,
                    createdBy,
                    userId: userId ?? "",
                    status: 1,
                    productCode: checkProductLabeling.productCode,
                    productId: checkProductLabeling.productId,
                    productName: checkProductLabeling.productName,
                    labelingProductId: checkProductLabeling.labelingProductId,
                    labelingProducts: checkProductLabeling.codeLabel,
                    scanDate,
                    campaignId: getPoint?.campaignId,
                  },
                },
              },
            });

            if (newAdd) {
              return newAdd.point;
            } else {
              throw new Error(`Point gagal di berikan...`);
            }
          }
        } else {
          throw new Error("Mohon Maaf QR ini sudah di-scan sebelumnya.");
        }
      } else {
        throw new Error(`Mohon Maaf QR ini tidak di temukan.`);
      }
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function topTenPoint() {
  try {
    const topPoints = await prisma.pointLoyalty.findMany({
      orderBy: {
        point: "desc",
      },
      take: 10,
      include: {
        userIdData: true,
      },
    });

    const result = topPoints.map((entry) => ({
      nama: entry.userIdData?.name || "Unknown",
      point: entry.point,
    }));

    return result;
  } catch (error: any) {
    throw new Error(`Error fetching top points: ${error.message}`);
  }
}
