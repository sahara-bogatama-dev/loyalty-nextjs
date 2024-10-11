"use server";

import _ from "lodash";

import { createServerAction, ServerActionError } from "@/lib/action-utils";
import { listStockopname, listUnlocation } from "./listStock.db";
import { addLocationStock, LocationStock } from "./crudStock.db";

//region labelng product
const listDataUnlocation = createServerAction(async () => {
  try {
    const data = await listUnlocation();

    return data;
  } catch (error: any) {
    throw new ServerActionError(error.message);
  }
});

const listDataStock = createServerAction(async () => {
  try {
    const data = await listStockopname();

    return data;
  } catch (error: any) {
    throw new ServerActionError(error.message);
  }
});

const addLocationStocks = createServerAction(
  async ({ location, updatedBy, labelingBox }: LocationStock) => {
    try {
      const data = await addLocationStock({ location, updatedBy, labelingBox });

      return data;
    } catch (error: any) {
      throw new ServerActionError(error.message);
    }
  }
);

export { listDataUnlocation, listDataStock, addLocationStocks };
//endregion
