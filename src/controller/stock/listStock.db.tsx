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
        2: "magenta",
        3: "red",
        4: "volcano",
        5: "orange",
        6: "gold",
        7: "lime",
        8: "saddlebrown",
        9: "royalblue",
        10: "lavender",
        11: "green",
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
