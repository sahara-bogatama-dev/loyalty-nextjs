import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";
import _ from "lodash";

const prisma = new PrismaClient();

export async function listDeliveryOrder() {
  try {
    return prisma.$transaction(async (tx) => {
      const data = await tx.deliveryOrder.findMany({
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      });

      const statusMap = await tx.stringMap.findMany({
        where: { objectName: "Status" },
      });

      const colorMap = {
        7: "lime",
        8: "saddlebrown",
        9: "royalblue",
        10: "lavender",
      } as any;

      return data.map((item) => {
        const match = _.find(statusMap, { key: item.status });
        const statusColor = colorMap[item.status] || "gray";

        return {
          ...item,
          totalWeight: String(item.totalWeight),
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

export async function listDeliveryOrderProduct({
  deliveryOrderId,
}: {
  deliveryOrderId: string;
}) {
  try {
    return prisma.$transaction(async (tx) => {
      const data = await tx.deliveryOrderProduct.findMany({
        where: { deliveryOrderId },
      });

      const statusMap = await tx.stringMap.findMany({
        where: { objectName: "Status" },
      });

      const colorMap = {
        7: "lime",
        8: "saddlebrown",
        9: "royalblue",
        10: "lavender",
      } as any;

      return data.map((item) => {
        const match = _.find(statusMap, { key: item.statusProduct });
        const statusColor = colorMap[item.statusProduct] || "gray";

        return {
          ...item,

          statusCode: item.statusProduct,
          status: match ? match.name : "Unknown",
          statusColor,
        };
      });
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function listDeliveryOrderMobile({ days }: { days: number }) {
  try {
    return prisma.$transaction(async (tx) => {
      const data = await tx.deliveryOrder.findMany({
        where: { createdAt: { gte: dayjs().subtract(days, "day").toDate() } },
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      });

      const statusMap = await tx.stringMap.findMany({
        where: { objectName: "Status" },
      });

      const colorMap = {
        7: "lime",
        8: "saddlebrown",
        9: "royalblue",
        10: "lavender",
      } as any;

      return data.map((item) => {
        const match = _.find(statusMap, { key: item.status });
        const statusColor = colorMap[item.status] || "gray";

        return {
          ...item,
          totalWeight: String(item.totalWeight),
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

export async function listDeliveryOrderRangeDate({
  startDate,
  endDate,
}: {
  startDate: Date;
  endDate: Date;
}) {
  try {
    return prisma.$transaction(async (tx) => {
      const data = await tx.deliveryOrder.findMany({
        where: {
          createdAt: {
            gte: dayjs(startDate).startOf("day").toDate(),
            lte: dayjs(endDate).endOf("day").toDate(),
          },
        },
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      });

      const statusMap = await tx.stringMap.findMany({
        where: { objectName: "Status" },
      });

      const colorMap = {
        7: "lime",
        8: "saddlebrown",
        9: "royalblue",
        10: "lavender",
      } as any;

      return data.map((item) => {
        const match = _.find(statusMap, { key: item.status });
        const statusColor = colorMap[item.status] || "gray";

        return {
          ...item,
          totalWeight: String(item.totalWeight),
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
