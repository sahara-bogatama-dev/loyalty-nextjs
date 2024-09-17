import { PrismaClient } from "@prisma/client";
import _ from "lodash";
import moment from "moment";

const prisma = new PrismaClient();

export async function listUnit() {
  try {
    return prisma.$transaction(async (tx) => {
      const unitList = await tx.stringMap.findMany({
        where: { objectName: "Unit Product" },
      });

      return unitList;
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function addProduct({
  productCode,
  productName,
  weight,
  basePoint,
  unit,
  expiredPeriod,
  createdBy,
}: {
  productName: string;
  productCode: string;
  weight: number;
  basePoint: number;
  unit: string;
  expiredPeriod: number;
  createdBy: string;
}) {
  try {
    return prisma.$transaction(async (tx) => {
      const checkProductCode = await tx.product.findUnique({
        where: { productCode },
      });

      if (!checkProductCode) {
        const productAdd = await tx.product.create({
          data: {
            productCode,
            productName,
            weight,
            basePoint,
            unit,
            expiredPeriod: moment().add(expiredPeriod, "days").toDate(),
            createdBy,
          },
        });

        return productAdd;
      } else {
        throw new Error(`Product Code sudah terinput.`);
      }
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function downloadProduct() {
  try {
    return prisma.$transaction(async (tx) => {
      const productList = await tx.product.findMany();

      return productList;
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function batchUploadProduct({ data }: { data: any }) {
  try {
    const result = await prisma.$transaction([
      prisma.product.createMany({
        data: data,
        skipDuplicates: true,
      }),
    ]);

    return result;
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function searchProduct({ findSearch }: { findSearch?: string }) {
  try {
    return prisma.$transaction(async (tx) => {
      const searchUser = await tx.product.findMany({
        where: {
          OR: [
            { productCode: { contains: findSearch } },
            { productName: { contains: findSearch } },
          ],
        },
        orderBy: { createdAt: "asc" },
      });

      return searchUser;
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}
