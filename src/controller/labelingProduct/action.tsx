"use server";

import _ from "lodash";

import { createServerAction, ServerActionError } from "@/lib/action-utils";
import { listLabelingProduct } from "./listLabelingProduct.db";
import {
  addLabelingProduct,
  listGetProduct,
  printedProduct,
  ProductLabel,
} from "./crudLabelingProduct.db";

//region labelng product
const listDataLabelingProduct = createServerAction(async () => {
  try {
    const data = await listLabelingProduct();

    return data;
  } catch (error: any) {
    throw new ServerActionError(error.message);
  }
});

const listDataGetProduct = createServerAction(async () => {
  try {
    const data = await listGetProduct();

    return data;
  } catch (error: any) {
    throw new ServerActionError(error.message);
  }
});

const createLabelingProduct = createServerAction(
  async ({ productId, shift, batch, qty, createdBy }: ProductLabel) => {
    try {
      const data = await addLabelingProduct({
        productId,
        shift,
        batch,
        qty,
        createdBy,
      });

      return data;
    } catch (error: any) {
      throw new ServerActionError(error.message);
    }
  }
);

const printLabelingProduct = createServerAction(
  async ({
    labelingProductId,
    updatedBy,
  }: {
    labelingProductId: string[];
    updatedBy: string;
  }) => {
    try {
      const data = await printedProduct({
        labelingProductId,
        updatedBy,
      });

      return data;
    } catch (error: any) {
      throw new ServerActionError(error.message);
    }
  }
);

export {
  listDataLabelingProduct,
  listDataGetProduct,
  createLabelingProduct,
  printLabelingProduct,
};
//endregion
