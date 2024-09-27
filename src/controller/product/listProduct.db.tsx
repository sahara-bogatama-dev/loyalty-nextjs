import { PrismaClient } from "@prisma/client";
import _ from "lodash";
import moment from "moment";

const prisma = new PrismaClient();

export async function listProducts() {
  try {
    const [result, count] = await prisma.$transaction([
      prisma.product.findMany({
        orderBy: { createdAt: "asc" },
      }),
      prisma.product.count(),
    ]);

    const serializedProducts = result.map((product) => ({
      ...product,
      weight: product.weight.toString(),
    }));

    return { serializedProducts, count };
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}
