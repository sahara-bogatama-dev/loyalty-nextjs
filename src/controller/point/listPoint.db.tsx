import { PrismaClient } from "@prisma/client";
import _ from "lodash";
import { Point } from "./crudPoint.db";

const prisma = new PrismaClient();

export async function listPointBank() {
  try {
    return prisma.$transaction(async (tx) => {
      const data = await tx.pointLoyalty.findMany({
        include: {
          userIdData: { select: { name: true, email: true, phone: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      return _.map(data, (item) => ({
        ...item,
        name: item.userIdData?.name,
        email: item.userIdData?.email,
        phone: item.userIdData?.phone,
      }));
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function pointData({ userId }: { userId: string }) {
  try {
    return prisma.$transaction(async (tx) => {
      const data = await tx.pointLoyalty.findFirst({
        where: { userId },
        include: {
          log: true,
        },
        orderBy: { createdAt: "desc" },
      });

      const statusMap = await tx.stringMap.findMany({
        where: { objectName: "Point Status" },
      });

      const colorMap = {
        1: "green",
        2: "magenta",
        3: "geekblue",
      } as any;

      const log = data?.log.map((item) => {
        const match = _.find(statusMap, { key: item.status });
        const statusColor = colorMap[item.status] || "gray";

        return {
          ...item,
          statusCode: item.status,
          status: match ? match.name : "Unknown",
          statusColor,
        };
      });
      return { ...data, log };
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function listActivityLogPoint({ pointId }: Point) {
  try {
    return prisma.$transaction(async (tx) => {
      const data = await tx.pointReceiveLog.findMany({
        where: { pointId },
      });

      const statusMap = await tx.stringMap.findMany({
        where: { objectName: "Point Status" },
      });

      const colorMap = {
        1: "green",
        2: "magenta",
        3: "geekblue",
      } as any;

      return data.map((item) => {
        const match = _.find(statusMap, { key: item.status });
        const statusColor = colorMap[item.status] || "gray";

        return {
          ...item,
          statusCode: item.status,
          status: match ? match.name : "Unknown",
          statusColor,
        };
      });
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}
