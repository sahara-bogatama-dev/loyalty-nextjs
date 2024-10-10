import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";
import _ from "lodash";

const prisma = new PrismaClient();

export interface ProductLabel {
  productId: string;
  shift: number;
  batch: string;
  qty: number;
  createdBy: string;
}

export async function listGetProduct() {
  try {
    return prisma.$transaction(async (tx) => {
      const productList = await tx.product.findMany({
        orderBy: { productName: "asc" },
      });

      const finalization = _.map(productList, (o) => ({
        id: o.productId,
        productName: `${o.productCode} - ${o.productName} - ${o.unit} - ${o.weight}KG`,
      }));
      return finalization;
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function printedProduct({
  labelingProductId,
  updatedBy,
}: {
  labelingProductId: string[];
  updatedBy: string;
}) {
  try {
    return prisma.$transaction(async (tx) => {
      const productList = await tx.labelingProduct.updateMany({
        where: { labelingProductId: { in: labelingProductId } },
        data: { status: 1, updatedBy },
      });
      return productList;
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function addLabelingProduct({
  productId,
  shift,
  batch,
  qty,
  createdBy,
}: ProductLabel) {
  try {
    return prisma.$transaction(async (tx) => {
      const findProduct = await tx.product.findUnique({ where: { productId } });

      if (findProduct) {
        const manyLabeling = Array.from({ length: qty }).map((_, idx) => ({
          productId: findProduct.productId,
          productCode: findProduct.productCode,
          productName: findProduct.productName,
          codeLabel: `SBI${String(
            dayjs().diff(dayjs("1899-12-30", "YYYY-MM-DD"), "day")
          )}${findProduct.productCode}${shift}${batch}${String(++idx).padStart(
            3,
            "0"
          )}`,
          bestBefore: findProduct.expiredPeriod,
          shift: shift,
          batch: String(batch),
          createdBy,
        }));

        const manyProduct = await tx.labelingProduct.createMany({
          data: manyLabeling,
          skipDuplicates: true,
        });

        if (manyProduct) {
          const duplicateCount = manyLabeling.length - manyProduct.count;

          const productids = _.map(manyLabeling, "productId");
          const labelCodeIds = _.map(manyLabeling, "codeLabel");

          const findProduct = await tx.product.findMany({
            where: { productId: { in: productids } },
          });

          const findLabelProduct = await tx.labelingProduct.findMany({
            where: { codeLabel: { in: labelCodeIds } },
          });

          if (findProduct && findLabelProduct) {
          } else {
            throw new Error("Gagal menambahkan ke stock!");
          }
        } else {
          throw new Error("Gagal membuat labeling product!");
        }
      } else {
        throw new Error(`Product tidak ditemukan!`);
      }
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}
