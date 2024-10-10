import { PrismaClient } from "@prisma/client";
import _ from "lodash";

const prisma = new PrismaClient();

export async function listLabelingProduct() {
  try {
    return prisma.$transaction(async (tx) => {
      const labelingProduct = await tx.labelingProduct.findMany({
        where: { status: 1, labelingBoxId: null },
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      });

      return labelingProduct;
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function listLabelingBox() {
  try {
    return prisma.$transaction(async (tx) => {
      const labelingBox = await tx.labelingBox.findMany({
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
        include: { labelingProduct: true },
      });

      const statusMap = await tx.stringMap.findMany({
        where: { objectName: "Status" },
      });

      const colorMap = {
        0: "red",
        1: "green",
      } as any;

      return labelingBox.map((item) => {
        const match = _.find(statusMap, { key: item.status });
        const statusColor = colorMap[item.status] || "gray";

        return {
          ...item,
          status: match ? match.name : "Unknown",
          total: _.size(item.labelingProduct),
          statusColor,
        };
      });
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}
