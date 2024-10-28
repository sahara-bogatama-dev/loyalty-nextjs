"use server";

import _ from "lodash";

import { createServerAction, ServerActionError } from "@/lib/action-utils";

import { listDataMember, listDataOwner } from "./../booth/listBooth.db";
import {
  addBoothMember,
  addBoothOwner,
  BoothMember,
  BoothOwner,
  detailOwner,
  listUser,
} from "./crudBooth.db";

//region booth

const listOwner = createServerAction(async () => {
  try {
    const data = await listDataOwner();

    return data;
  } catch (error: any) {
    throw new ServerActionError(error.message);
  }
});

const listMember = createServerAction(
  async ({ boothId }: { boothId: string }) => {
    try {
      const data = await listDataMember({ boothId });

      return data;
    } catch (error: any) {
      throw new ServerActionError(error.message);
    }
  }
);

const detailOwners = createServerAction(
  async ({ userId }: { userId: string }) => {
    try {
      const data = await detailOwner({ userId });

      return data;
    } catch (error: any) {
      throw new ServerActionError(error.message);
    }
  }
);

const addBoothMembers = createServerAction(
  async ({
    userId,
    address,
    boothId,
    photo,
    geolocation,
    createdBy,
  }: BoothMember) => {
    try {
      const data = await addBoothMember({
        userId,
        address,
        boothId,
        photo,
        geolocation,
        createdBy,
      });

      return data;
    } catch (error: any) {
      throw new ServerActionError(error.message);
    }
  }
);

const addBoothOwners = createServerAction(
  async ({
    userId,
    address,
    dateEstablishment,
    ig,
    fb,
    ecm,
    geolocation,
    createdBy,
  }: BoothOwner) => {
    try {
      const data = await addBoothOwner({
        userId,
        address,
        dateEstablishment,
        ig,
        fb,
        ecm,
        geolocation,
        createdBy,
      });

      return data;
    } catch (error: any) {
      throw new ServerActionError(error.message);
    }
  }
);

const listUsersBooth = createServerAction(async () => {
  try {
    const data = await listUser();

    return data;
  } catch (error: any) {
    throw new ServerActionError(error.message);
  }
});

export {
  listOwner,
  listMember,
  addBoothMembers,
  addBoothOwners,
  listUsersBooth,
  detailOwners,
};
//endregion
