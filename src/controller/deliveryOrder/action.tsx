"use server";

import _ from "lodash";

import { createServerAction, ServerActionError } from "@/lib/action-utils";
import {
  listDeliveryOrder,
  listDeliveryOrderMobile,
  listDeliveryOrderProduct,
} from "./listDeliveryOrder.db";
import {
  addDR,
  canceledDR,
  DeliveryOrder,
  findProductBox,
  listProductBox,
  printDR,
  receiveDR,
  submitDR,
} from "./crudDeliveryOrder.db";
import dayjs from "dayjs";

//region labelng product

const listDataDelivery = createServerAction(async () => {
  try {
    const data = await listDeliveryOrder();

    return data;
  } catch (error: any) {
    throw new ServerActionError(error.message);
  }
});

const listDataDeliveryMobile = createServerAction(
  async ({ days }: { days: number }) => {
    try {
      const data = await listDeliveryOrderMobile({ days });

      return data;
    } catch (error: any) {
      throw new ServerActionError(error.message);
    }
  }
);

const listDataDeliveryProduct = createServerAction(
  async ({ deliveryOrderId }: DeliveryOrder) => {
    try {
      const data = await listDeliveryOrderProduct({
        deliveryOrderId: deliveryOrderId ?? "",
      });

      return data;
    } catch (error: any) {
      throw new ServerActionError(error.message);
    }
  }
);

const cancelDR = createServerAction(
  async ({ deliveryOrderId, updatedBy }: DeliveryOrder) => {
    try {
      const data = await canceledDR({ deliveryOrderId, updatedBy });

      return data;
    } catch (error: any) {
      throw new ServerActionError(error.message);
    }
  }
);

const submitPrintDR = createServerAction(
  async ({ deliveryOrderId, updatedBy }: DeliveryOrder) => {
    try {
      const data = await submitDR({ deliveryOrderId, updatedBy });

      return data;
    } catch (error: any) {
      throw new ServerActionError(error.message);
    }
  }
);

const downloadDR = createServerAction(
  async ({ deliveryOrderId }: DeliveryOrder) => {
    try {
      const data = await printDR({ deliveryOrderId });

      return data;
    } catch (error: any) {
      throw new ServerActionError(error.message);
    }
  }
);

const receivesDR = createServerAction(
  async ({
    deliveryOrderId,
    receiveDate,
    receiveBy,
    receiveNote,
    dataQty,
    updatedBy,
  }: DeliveryOrder) => {
    try {
      const data = await receiveDR({
        deliveryOrderId,
        receiveDate,
        receiveBy,
        receiveNote,
        dataQty,
        updatedBy,
      });

      return data;
    } catch (error: any) {
      throw new ServerActionError(error.message);
    }
  }
);

const addDRS = createServerAction(
  async ({
    noOrder,
    noSurat,
    shippingDate,
    agentId,
    customerName,
    deliveryAddress,
    totalWeight,
    deliveryNote,
    createdBy,
    product,
  }: DeliveryOrder) => {
    try {
      const data = await addDR({
        noOrder,
        noSurat,
        shippingDate: shippingDate,
        agentId: agentId ?? "",
        customerName: customerName ?? "",
        deliveryAddress: deliveryAddress ?? "",
        totalWeight: totalWeight ?? 0,
        deliveryNote,
        product: product ?? [],
        createdBy,
      });

      return data;
    } catch (error: any) {
      throw new ServerActionError(error.message);
    }
  }
);

const listProductBoxs = createServerAction(async () => {
  try {
    const data = await listProductBox();

    return data;
  } catch (error: any) {
    throw new ServerActionError(error.message);
  }
});

const findProductBoxs = createServerAction(
  async ({ labelingBox }: { labelingBox: string }) => {
    try {
      const data = await findProductBox({ labelingBox });

      return data;
    } catch (error: any) {
      throw new ServerActionError(error.message);
    }
  }
);
export {
  listDataDelivery,
  listDataDeliveryProduct,
  downloadDR,
  submitPrintDR,
  receivesDR,
  cancelDR,
  listDataDeliveryMobile,
  addDRS,
  listProductBoxs,
  findProductBoxs,
};
//endregion
