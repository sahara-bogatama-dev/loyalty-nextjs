import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";
import _ from "lodash";

const prisma = new PrismaClient();

export interface DeliveryOrder {
  shippingDate?: string;
  agentId?: string;
  customerName?: string;
  deliveryAddress?: string;
  totalWeight?: number;
  deliveryNote?: string;
  status?: number;
  product?: {
    shipQty: number;
    labelingBox: string;
    labelingBoxId: string;
    productName: string;
    unit: string;
    createdBy: string;
    statusProduct: number;
  }[];

  deliveryOrderId?: string;
  receiveDate?: string;
  receiveBy?: string;
  receiveNote?: string;
  dataQty?: { deliveryOrderProductId: string; receivedQty: number }[];
  updatedBy?: string;
  createdBy?: string;
}

export async function canceledDR({
  deliveryOrderId,
  updatedBy,
}: DeliveryOrder) {
  try {
    return prisma.$transaction(async (tx) => {
      const update = await tx.deliveryOrder.update({
        where: { deliveryOrderId },
        data: {
          status: 10,
          updatedBy,
        },
        include: { deliveryOrderProduct: true },
      });

      if (update) {
        const productOrderIds = _.map(
          update.deliveryOrderProduct,
          (o) => o.deliveryOrderProductId
        );

        await tx.deliveryOrderProduct.updateMany({
          where: { deliveryOrderProductId: { in: productOrderIds } },
          data: { statusProduct: 10, updatedBy },
        });

        const labelBoxId = _.compact(
          _.map(update.deliveryOrderProduct, "labelingBoxId")
        );

        const updateStock = await tx.stokopname.updateMany({
          where: { labelingBoxId: { in: labelBoxId } },
          data: { status: 6, updatedBy },
        });

        return updateStock;
      } else {
        throw new Error(`Gagal cancel DR.`);
      }
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function receiveDR({
  deliveryOrderId,
  receiveDate,
  receiveBy,
  receiveNote,
  dataQty,
  updatedBy,
}: DeliveryOrder) {
  try {
    return prisma.$transaction(async (tx) => {
      const update = await tx.deliveryOrder.update({
        where: { deliveryOrderId },
        data: {
          status: 9,
          receiveBy,
          receiveDate,
          receiveNote,
          updatedBy,
        },
        include: { deliveryOrderProduct: true },
      });

      if (update) {
        const labelBoxId = _.compact(
          _.map(update.deliveryOrderProduct, "labelingBoxId")
        );

        if (dataQty) {
          for (const record of dataQty) {
            await tx.deliveryOrderProduct.update({
              where: { deliveryOrderProductId: record.deliveryOrderProductId },
              data: { receivedQty: record.receivedQty, statusProduct: 9 },
            });
          }
        } else {
          throw new Error(`Data Qty Empty.`);
        }

        const updateStock = await tx.stokopname.updateMany({
          where: { labelingBoxId: { in: labelBoxId } },
          data: { status: 11, updatedBy },
        });

        return updateStock;
      } else {
        throw new Error(`Gagal cancel DR.`);
      }
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function submitDR({ deliveryOrderId, updatedBy }: DeliveryOrder) {
  try {
    return prisma.$transaction(async (tx) => {
      const data = await tx.deliveryOrder.update({
        where: { deliveryOrderId },
        data: { status: 8, updatedBy },
        include: { deliveryOrderProduct: true },
      });

      if (data) {
        const productOrderIds = _.map(
          data.deliveryOrderProduct,
          (o) => o.deliveryOrderProductId
        );

        const labelBoxId = _.compact(
          _.map(data.deliveryOrderProduct, "labelingBoxId")
        );

        await tx.deliveryOrderProduct.updateMany({
          where: { deliveryOrderProductId: { in: productOrderIds } },
          data: { statusProduct: 8, updatedBy },
        });

        await tx.stokopname.updateMany({
          where: { labelingBoxId: { in: labelBoxId } },
          data: { status: 11, updatedBy },
        });

        return data;
      }

      return data;
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function printDR({ deliveryOrderId }: DeliveryOrder) {
  try {
    return prisma.$transaction(async (tx) => {
      const data = await tx.deliveryOrder.findFirst({
        where: { deliveryOrderId, status: 8 },
        include: { deliveryOrderProduct: true },
      });

      return data;
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function listProductBox() {
  try {
    return prisma.$transaction(async (tx) => {
      const data = await tx.stokopname.findMany({
        where: { labelingBoxId: { not: null }, status: { in: [4, 6] } },
        distinct: ["labelingBoxId"],
      });

      return data;
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function addDR({
  shippingDate,
  agentId,
  customerName,
  deliveryAddress,
  totalWeight,
  deliveryNote,
  createdBy,
  product,
}: DeliveryOrder) {
  try {
    return prisma.$transaction(async (tx) => {
      const findLastNumber = await tx.runningNumber.findUnique({
        where: { id: "cm2iu3rcb008o0cl4cbln0bfz" },
      });

      const data = await tx.deliveryOrder.create({
        data: {
          noSurat: `FG/OUT/${findLastNumber?.value ?? 0}`,
          orderNo: String(findLastNumber?.value) ?? "0",
          shippingDate: shippingDate ?? dayjs().toDate(),
          agentId: agentId ?? "",
          customerName: customerName ?? "",
          deliveryAddress: deliveryAddress ?? "",
          totalWeight: totalWeight ?? 0,
          deliveryNote,
          status: 7,
          createdBy,
          deliveryOrderProduct: {
            createMany: { data: product ?? [], skipDuplicates: true },
          },
        },
      });

      const updateRunningNumber = await tx.runningNumber.updateMany({
        where: { id: "cm2iu3rcb008o0cl4cbln0bfz" },
        data: {
          value: { increment: 1 },
        },
      });

      return { data, lastNumberDR: updateRunningNumber };
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}
