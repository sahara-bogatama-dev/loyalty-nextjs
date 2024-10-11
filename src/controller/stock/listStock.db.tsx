import { PrismaClient } from "@prisma/client";
import _ from "lodash";

const prisma = new PrismaClient();

export async function listStockopname() {
  try {
    return prisma.$transaction(async (tx) => {
      const data = await tx.stokopname.findMany({
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      });

      const statusMap = await tx.stringMap.findMany({
        where: { objectName: "Status" },
      });

      const colorMap = {
        2: "magenta", // Printed - Labeling Product
        3: "red", // Unprinted - Labeling Box
        4: "volcano", // Printed - Labeling Box
        5: "orange", // Unprinted - Labeling Product
        6: "gold", // InStock
        7: "lime", // On Delivery
        8: "green", // Sold
      } as any;

      return data.map((item) => {
        const match = _.find(statusMap, { key: item.status });
        const statusColor = colorMap[item.status] || "gray";

        return {
          ...item,
          weight: String(item.weight),
          status: match ? match.name : "Unknown",
          statusColor,
        };
      });
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function listUnlocation() {
  try {
    return prisma.$transaction(async (tx) => {
      const data = await tx.stokopname.findMany({
        where: { location: null, labelingBoxId: { not: null }, status: 4 },
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      });

      return _.uniqBy(data, "labelingBox").map((item) => ({
        value: item.labelingBox,
        label: item.labelingBox,
      }));
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}
