"use server";

import { createServerAction, ServerActionError } from "@/lib/action-utils";
import {
  addPackage,
  deletePackageRedeem,
  PackageRedeems,
  updatePackageImage,
  updatePackageRedeem,
} from "./crudPackage.db";
import {
  listDataPackageRedeem,
  listDataPackageRedeemByUserId,
} from "./listPackageRedeem.db";

//region package redeem
const listPackage = createServerAction(async () => {
  try {
    const data = await listDataPackageRedeem();

    return data;
  } catch (error: any) {
    throw new ServerActionError(error.message);
  }
});

const listPackageUser = createServerAction(
  async ({ userId }: { userId: string }) => {
    try {
      const data = await listDataPackageRedeemByUserId({ userId });

      return data;
    } catch (error: any) {
      throw new ServerActionError(error.message);
    }
  }
);

const addPackages = createServerAction(
  async ({
    packageName,
    costPoint,
    limit,
    image,
    description,
    createdBy,
  }: PackageRedeems) => {
    try {
      const data = await addPackage({
        packageName,
        costPoint,
        limit,
        image,
        description,
        createdBy,
      });

      return data;
    } catch (error: any) {
      throw new ServerActionError(error.message);
    }
  }
);

const deletePackages = createServerAction(
  async ({ packageId }: { packageId: string }) => {
    try {
      const data = await deletePackageRedeem({ packageId });

      return data;
    } catch (error: any) {
      throw new ServerActionError(error.message);
    }
  }
);

const updatePackage = createServerAction(
  async ({
    packageId,
    packageName,
    costPoint,
    limit,
    description,
    inActive,
    updatedBy,
  }: PackageRedeems) => {
    try {
      const data = await updatePackageRedeem({
        packageId,
        packageName,
        costPoint,
        limit,
        description,
        inActive,
        updatedBy,
      });

      return data;
    } catch (error: any) {
      throw new ServerActionError(error.message);
    }
  }
);

const changeImagePackage = createServerAction(
  async ({
    packageId,
    image,
    updatedBy,
  }: {
    packageId?: string;
    image: any;
    updatedBy: string;
  }) => {
    try {
      const data = await updatePackageImage({
        packageId,
        image: Buffer.from(image, "base64"),
        updatedBy,
      });

      return data;
    } catch (error: any) {
      throw new ServerActionError(error.message);
    }
  }
);

export {
  listPackage,
  addPackages,
  deletePackages,
  updatePackage,
  changeImagePackage,
  listPackageUser,
};
//endregion
