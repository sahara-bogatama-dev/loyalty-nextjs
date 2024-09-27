import { PrismaClient } from "@prisma/client";
import _ from "lodash";
import moment from "moment";

const prisma = new PrismaClient();

export async function paginationListProduct({
  skip,
  take,
}: {
  skip: number;
  take: number;
}) {
  try {
    const [result, count] = await prisma.$transaction([
      prisma.product.findMany({
        skip,
        take,
        orderBy: { createdAt: "asc" },
      }),
      prisma.product.count(),
    ]);

    return { result, count };
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function listProducts() {
  try {
    const [result, count] = await prisma.$transaction([
      prisma.product.findMany({
        orderBy: { createdAt: "asc" },
      }),
      prisma.product.count(),
    ]);

    return { result, count };
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}
