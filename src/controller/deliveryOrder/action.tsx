"use server";

import _ from "lodash";

import { createServerAction, ServerActionError } from "@/lib/action-utils";
import {
  listDeliveryOrder,
  listDeliveryOrderProduct,
} from "./listDeliveryOrder.db";
import {
  canceledDR,
  DeliveryOrder,
  printDR,
  receiveDR,
  submitDR,
} from "./crudDeliveryOrder.db";

//region labelng product

const listDataDelivery = createServerAction(async () => {
  try {
    const data = await listDeliveryOrder();

    return data;
  } catch (error: any) {
    throw new ServerActionError(error.message);
  }
});

const listDataDeliveryProduct = createServerAction(
  async ({ deliveryOrderId }: DeliveryOrder) => {
    try {
      const data = await listDeliveryOrderProduct({ deliveryOrderId });

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

export {
  listDataDelivery,
  listDataDeliveryProduct,
  downloadDR,
  submitPrintDR,
  receivesDR,
  cancelDR,
};
//endregion
