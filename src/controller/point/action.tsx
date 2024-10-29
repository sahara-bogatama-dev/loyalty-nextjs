"use server";

import _ from "lodash";

import { createServerAction, ServerActionError } from "@/lib/action-utils";
import { listActivityLogPoint, listPointBank, pointData } from "./listPoint.db";
import { addPoint, pinaltyPoint, Point } from "./crudPoint.db";

//region labelng product

const listDataPoint = createServerAction(async () => {
  try {
    const data = await listPointBank();

    return data;
  } catch (error: any) {
    throw new ServerActionError(error.message);
  }
});

const listCurrentPoint = createServerAction(
  async ({ userId }: { userId: string }) => {
    try {
      const data = await pointData({ userId });

      return data;
    } catch (error: any) {
      throw new ServerActionError(error.message);
    }
  }
);

const listDataActivityLogPoint = createServerAction(
  async ({ pointId }: Point) => {
    try {
      const data = await listActivityLogPoint({ pointId });

      return data;
    } catch (error: any) {
      throw new ServerActionError(error.message);
    }
  }
);

const addPinalty = createServerAction(
  async ({ pointId, updatedBy, point }: Point) => {
    try {
      const data = await pinaltyPoint({ pointId, updatedBy, point });

      return data;
    } catch (error: any) {
      throw new ServerActionError(error.message);
    }
  }
);

const addPoints = createServerAction(
  async ({ userId, createdBy, labelingProduct, scanDate }: Point) => {
    try {
      const data = await addPoint({
        userId,
        createdBy,
        labelingProduct,
        scanDate,
      });

      return data;
    } catch (error: any) {
      throw new ServerActionError(error.message);
    }
  }
);

export {
  listDataPoint,
  listDataActivityLogPoint,
  addPinalty,
  addPoints,
  listCurrentPoint,
};
//endregion
