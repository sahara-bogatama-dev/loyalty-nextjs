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
  noSurat?: string;
  noOrder?: string;
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

export async function listProductDeliveryOrder({
  deliveryId,
}: {
  deliveryId: string;
}) {
  try {
    return prisma.$transaction(async (tx) => {
      const data = await tx.deliveryOrderProduct.findMany({
        where: { deliveryOrderId: deliveryId },
      });

      return data;
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function findProductBox({ labelingBox }: { labelingBox: string }) {
  try {
    return prisma.$transaction(async (tx) => {
      const data = await tx.stokopname.findMany({
        where: { labelingBox, status: { in: [4, 6] } },
      });

      if (!data) {
        throw new Error(`Mohon maaf labeling box tidak di temukan.`);
      }

      return _.uniqBy(
        _.map(data, (o) => ({
          shipQty: _.size(data),
          labelingBox: o.labelingBox,
          labelingBoxId: o.labelingBoxId,
          productName: o.productName,
          unit: o.unit,
          weight: _.sumBy(data, (o) => {
            return Number(o.weight);
          }),
        })),
        "labelingBoxId"
      );
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function addDR({
  noSurat,
  noOrder,
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
      const existDR = await tx.deliveryOrder.findFirst({ where: { noSurat } });

      if (existDR) {
        throw new Error(
          `Delivery Request sudah dibikin silahkaan refresh No Surat.`
        );
      }

      const data = await tx.deliveryOrder.create({
        data: {
          noSurat: noSurat ?? "",
          orderNo: noOrder ?? "",
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

      const running = await tx.runningNumber.findFirst();

      const updateRunningNumber = await tx.runningNumber.update({
        where: { id: running?.id },
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
