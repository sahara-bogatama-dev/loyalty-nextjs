import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";
import _ from "lodash";

const prisma = new PrismaClient();

export interface DeliveryOrder {
  deliveryOrderId: string;
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
