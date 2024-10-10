import { PrismaClient } from "@prisma/client";
import _ from "lodash";

const prisma = new PrismaClient();

export async function listLabelingProduct() {
  try {
    return prisma.$transaction(async (tx) => {
      const labelingProduct = await tx.labelingProduct.findMany({
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      });

      const statusMap = await tx.stringMap.findMany({
        where: { objectName: "Status" },
      });

      const colorMap = {
        0: "red",
        1: "green",
      } as any;

      return labelingProduct.map((item) => {
        const match = _.find(statusMap, { key: item.status });
        const statusColor = colorMap[item.status] || "gray";

        return {
          ...item,
          status: match ? match.name : "Unknown",
          statusColor,
        };
      });
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}
