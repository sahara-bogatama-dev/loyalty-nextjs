import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";
import _ from "lodash";

const prisma = new PrismaClient();

export interface Point {
  pointId?: string;
  createdBy?: string;
  updatedBy?: string;
  point?: number;
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
