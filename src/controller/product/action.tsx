"use server";

import _ from "lodash";
import {
  addProduct,
  batchUploadProduct,
  downloadProduct,
  listUnit,
  searchProduct,
} from "./crudProduct.db";
import { listProducts as allProducts } from "./listProduct.db";
import { createServerAction, ServerActionError } from "@/lib/action-utils";

//region product
const listUnits = createServerAction(async () => {
  try {
    const data = await listUnit();

    return _.map(data, (o) => ({ value: o.name, label: o.name }));
  } catch (error: any) {
    throw new ServerActionError(error.message);
  }
});

const addProducts = createServerAction(
  async ({
    productCode,
    productName,
    weight,
    basePoint,
    unit,
    expiredPeriod,
    createdBy,
  }: {
    productName: string;
    productCode: string;
    weight: number;
    basePoint: number;
    unit: string;
    expiredPeriod: number;
    createdBy: string;
  }) => {
    try {
      const data = await addProduct({
        productCode,
        productName,
        weight,
        basePoint,
        unit,
        expiredPeriod,
        createdBy,
      });

      return data;
    } catch (error: any) {
      throw new ServerActionError(error.message);
    }
  }
);

const allProductData = createServerAction(async () => {
  try {
    const data = await allProducts();

    return data;
  } catch (error: any) {
    throw new ServerActionError(error.message);
  }
});

const uploadProduct = createServerAction(async ({ data }: { data: any }) => {
  try {
    const productUpload = await batchUploadProduct({ data });

    return productUpload;
  } catch (error: any) {
    throw new ServerActionError(error.message);
  }
});

export { allProductData, listUnits, addProducts, uploadProduct };
//endregion
