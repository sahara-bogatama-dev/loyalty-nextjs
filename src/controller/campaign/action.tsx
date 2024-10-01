"use server";

import _ from "lodash";

import {
  addCampaign,
  Campaigns,
  currentProduct,
  deleteCampaign,
  disableCampaign,
  listCampaignActive,
  listProduct,
  updateCampaign,
  updateCampaignImage,
  updateCampaignProduct,
} from "./crudCampaign.db";
import { listDataCampaign } from "./listCampaign.db";
import { createServerAction, ServerActionError } from "@/lib/action-utils";

//region campaign
const listProducts = createServerAction(async () => {
  try {
    const data = await listProduct();

    return _.map(data, (o) => ({
      value: o.productId,
      label: `${o.productCode} - ${o.productName}`,
    }));
  } catch (error: any) {
    throw new ServerActionError(error.message);
  }
});

const currentProducts = createServerAction(
  async ({ campaignId }: { campaignId: string }) => {
    try {
      const data = await currentProduct({ campaignId });

      const finalData = _.map(data, (o) => ({
        value: o.productId,
        label: `${o.productCode} - ${o.productName}`,
      }));

      return finalData;
    } catch (error: any) {
      throw new ServerActionError(error.message);
    }
  }
);

const addCampaigns = createServerAction(
  async ({
    campaignName,
    startDate,
    endDate,
    productId,
    loyaltyPoint,
    image,
    description,
    createdBy,
  }: {
    campaignName: string;
    startDate: string;
    endDate: string;
    productId: string[];
    loyaltyPoint: number;
    image: any;
    description: string;
    createdBy: string;
  }) => {
    try {
      const data = await addCampaign({
        campaignName,
        startDate,
        endDate,
        description,
        productId,
        loyaltyPoint,
        createdBy,
        image: Buffer.from(image, "base64"),
      });

      return data;
    } catch (error: any) {
      throw new ServerActionError(error.message);
    }
  }
);

const updateCampaigns = createServerAction(
  async ({
    campaignName,
    productId,
    oldProductId,
    startDate,
    endDate,
    loyaltyPoint,
    description,
    campaignId,
    updatedBy,
  }: Campaigns) => {
    try {
      const data = await updateCampaign({
        campaignName,
        productId,
        oldProductId,
        startDate,
        endDate,
        loyaltyPoint,
        description,
        campaignId,
        updatedBy,
      });

      return data;
    } catch (error: any) {
      throw new ServerActionError(error.message);
    }
  }
);

const listCampaignActives = createServerAction(async () => {
  try {
    const data = await listCampaignActive();

    return data;
  } catch (error: any) {
    throw new ServerActionError(error.message);
  }
});

const allDataCampaign = createServerAction(async () => {
  try {
    const data = await listDataCampaign();

    return data;
  } catch (error: any) {
    throw new ServerActionError(error.message);
  }
});

const disableCampaigns = createServerAction(
  async ({
    updatedBy,
    disable,
    campaignId,
  }: {
    campaignId?: string;
    updatedBy?: string;
    disable?: boolean;
  }) => {
    try {
      const data = await disableCampaign({ updatedBy, campaignId, disable });

      return data;
    } catch (error: any) {
      throw new ServerActionError(error.message);
    }
  }
);

const deleteCampaigns = createServerAction(
  async ({ campaignId }: { campaignId?: string }) => {
    try {
      const data = await deleteCampaign({ campaignId });

      return data;
    } catch (error: any) {
      throw new ServerActionError(error.message);
    }
  }
);

const changeImageCampaign = createServerAction(
  async ({
    campaignId,
    image,
    updatedBy,
  }: {
    campaignId?: string;
    image: any;
    updatedBy: string;
  }) => {
    try {
      const data = await updateCampaignImage({
        campaignId,
        image: Buffer.from(image, "base64"),
        updatedBy,
      });

      return data;
    } catch (error: any) {
      throw new ServerActionError(error.message);
    }
  }
);

const updateProductCampaign = createServerAction(
  async ({ oldProductId, productId, campaignId, updatedBy }: Campaigns) => {
    try {
      const data = await updateCampaignProduct({
        oldProductId,
        productId,
        campaignId,
        updatedBy,
      });

      return data;
    } catch (error: any) {
      throw new ServerActionError(error.message);
    }
  }
);

export {
  listProducts,
  addCampaigns,
  disableCampaigns,
  currentProducts,
  updateCampaigns,
  deleteCampaigns,
  listCampaignActives,
  allDataCampaign,
  changeImageCampaign,
  updateProductCampaign,
};
//endregion
