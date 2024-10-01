"use server";

import { signIn, signOut } from "@/lib/auth";

import { CredentialsSignin } from "next-auth";
import _ from "lodash";

import { createServerAction, ServerActionError } from "@/lib/action-utils";
import { paginationListPackageRedeem } from "./redeemPackage/listPackageRedeem.db";
import {
  addPackage,
  deletePackageRedeem,
  disablePackage,
  PackageRedeems,
  searchPackage,
  updatePackageRedeem,
} from "./redeemPackage/crudPackage.db";
import { listMember, paginationListOwner } from "./booth/listBooth.db";

//region action login
const login = createServerAction(
  async ({ email, password }: { email: any; password: any }) => {
    try {
      const auth = await signIn("credentials", {
        redirect: false,
        redirectTo: "/",
        email,
        password,
      });

      return auth;
    } catch (error) {
      const someError = error as CredentialsSignin;

      const cause = someError.cause as unknown as { err: string };
      throw new ServerActionError(cause?.err);
    }
  }
);
//endregion

//region action logout
const logout = createServerAction(async () => {
  await signOut({ redirect: true, redirectTo: "/" });
});
//endregion

export { login, logout };

//region package redeem
const paginationPackage = createServerAction(
  async ({ take, skip }: { take: number; skip: number }) => {
    try {
      const data = await paginationListPackageRedeem({ take, skip });

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

const disablePackages = createServerAction(
  async ({
    updatedBy,
    disable,
    packageId,
  }: {
    packageId?: string;
    updatedBy?: string;
    disable?: boolean;
  }) => {
    try {
      const data = await disablePackage({ updatedBy, packageId, disable });

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

const searchPackages = createServerAction(
  async ({ searchText }: { searchText: string }) => {
    try {
      const data = await searchPackage({ findSearch: searchText });

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
    image,
    description,
    updatedBy,
  }: PackageRedeems) => {
    try {
      const data = await updatePackageRedeem({
        packageId,
        packageName,
        costPoint,
        limit,
        image: image ? Buffer.from(image, "base64") : undefined,
        description,
        updatedBy,
      });

      return data;
    } catch (error: any) {
      throw new ServerActionError(error.message);
    }
  }
);

export {
  paginationPackage,
  addPackages,
  disablePackages,
  deletePackages,
  searchPackages,
  updatePackage,
};
//endregion

//region booth

const paginationOwner = createServerAction(
  async ({ take, skip }: { take: number; skip: number }) => {
    try {
      const data = await paginationListOwner({ take, skip });

      return data;
    } catch (error: any) {
      throw new ServerActionError(error.message);
    }
  }
);

const dataMember = createServerAction(
  async ({ take, skip }: { take: number; skip: number }) => {
    try {
      const data = await listMember({ take, skip });

      return data;
    } catch (error: any) {
      throw new ServerActionError(error.message);
    }
  }
);

export { paginationOwner, dataMember };
//endregion
