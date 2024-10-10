"use server";

import _ from "lodash";

import { createServerAction, ServerActionError } from "@/lib/action-utils";
import { listLabelingBox, listLabelingProduct } from "./listLabelingBox.db";
import {
  addLabelingBox,
  BoxLabel,
  getProductLabelingScan,
  printedBox,
} from "./crudLabelingBox.db";

//region labelng box
const listDataLabelingBox = createServerAction(async () => {
  try {
    const data = await listLabelingBox();

    return data;
  } catch (error: any) {
    throw new ServerActionError(error.message);
  }
});

const listDataLabelingProduct = createServerAction(async () => {
  try {
    const data = await listLabelingProduct();

    return data;
  } catch (error: any) {
    throw new ServerActionError(error.message);
  }
});

const scanDataLabelingProduct = createServerAction(
  async ({ codeLabel }: { codeLabel: string }) => {
    try {
      const data = await getProductLabelingScan({ codeLabel });

      return data;
    } catch (error: any) {
      throw new ServerActionError(error.message);
    }
  }
);

const addLabelingBoxs = createServerAction(
  async ({ labelingProductId, createdBy, leader }: BoxLabel) => {
    try {
      const data = await addLabelingBox({
        labelingProductId,
        createdBy,
        leader,
      });

      return data;
    } catch (error: any) {
      throw new ServerActionError(error.message);
    }
  }
);

const printLabelingBox = createServerAction(
  async ({
    labelingBoxId,
    updatedBy,
  }: {
    labelingBoxId: string[];
    updatedBy: string;
  }) => {
    try {
      const data = await printedBox({
        labelingBoxId,
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
  scanDataLabelingProduct,
  addLabelingBoxs,
  listDataLabelingBox,
  printLabelingBox,
};
//endregion
