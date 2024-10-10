import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";
import _ from "lodash";

const prisma = new PrismaClient();

export interface BoxLabel {
  labelingProductId: string[];
  leader: string;
  createdBy: string;
}

export async function getProductLabelingScan({
  codeLabel,
}: {
  codeLabel: string;
}) {
  try {
    return prisma.$transaction(async (tx) => {
      const productList = await tx.labelingProduct.findFirst({
        where: { codeLabel, status: 1, labelingBoxId: null },
      });

      return productList;
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function printedBox({
  labelingBoxId,
  updatedBy,
}: {
  labelingBoxId: string[];
  updatedBy: string;
}) {
  try {
    return prisma.$transaction(async (tx) => {
      const productList = await tx.labelingBox.updateMany({
        where: { labelingBoxId: { in: labelingBoxId } },
        data: { status: 1, updatedBy },
      });
      return productList;
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function addLabelingBox({
  labelingProductId,
  leader,
  createdBy,
}: BoxLabel) {
  try {
    return prisma.$transaction(async (tx) => {
      const countBox = await tx.labelingBox.count();
      const newCount = countBox + 1;

      const insertLabelBox = await tx.labelingBox.create({
        data: {
          codeBox: `PSBI${String(
            dayjs().diff(dayjs("1899-12-30", "YYYY-MM-DD"), "day")
          )}${_.toUpper(
            _.map(leader.split(" "), (word) => word[0]).join("")
          )}${dayjs().format("MM")}${newCount}`,
          createdBy,
          leader,
        },
      });

      if (insertLabelBox) {
        const updateProduct = await tx.labelingProduct.updateMany({
          where: { labelingProductId: { in: labelingProductId } },
          data: {
            labelingBoxId: insertLabelBox.labelingBoxId,
            updatedBy: createdBy,
          },
        });

        return { updateProduct };
      } else {
        throw new Error("Gagal generate box labeling");
      }
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}
