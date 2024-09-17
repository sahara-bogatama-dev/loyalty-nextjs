"use server";

import { signIn, signOut } from "@/lib/auth";

import { CredentialsSignin } from "next-auth";
import { userDetail } from "./userDetail/userDetail.db";
import _ from "lodash";
import moment from "moment";
import sendMailer from "@/lib/node.mailer";
import { createUser } from "./register/register.db";
import { paginationListUser } from "./listUser/listUser.db";
import { date } from "zod";
import { addRole, deleteRole, listRole } from "./listUser/listRole.db";
import { disableUser, searchUser, updateUser } from "./listUser/crudUser.db";
import {
  addProduct,
  batchUploadProduct,
  downloadProduct,
  listUnit,
  searchProduct,
} from "./product/crudProduct.db";
import { paginationListProduct } from "./product/listProduct.db";
import { addCampaign, listProduct } from "./campaign/crudCampaign.db";
import arrayBufferToBase64 from "@/lib/arrayBufferToBase64";
import { paginationListCampaign } from "./campaign/listUser.db";

//region action login
const login = async ({ email, password }: { email: any; password: any }) => {
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
    throw new Error(cause?.err);
  }
};
//endregion

//region action login
const logout = async () => {
  await signOut({ redirect: true, redirectTo: "/" });
};
//endregion

//region action get role user
const userRoles = async ({ id }: { id: string }) => {
  try {
    const detail = await userDetail({ id });

    return _.map(detail?.role, (o) => ({ role: o.id }));
  } catch (error: any) {
    throw new Error(error.message);
  }
};
//endregion

//region create internal user
const createInternalUser = async ({
  email,
  phone,
  dateofbirth,
  leader,
  fullname,
  createdBy,
}: {
  email?: string;
  phone?: string;
  dateofbirth?: string;
  leader?: string;
  fullname?: string;
  createdBy?: string;
}) => {
  try {
    const start = moment(`2000-01-01`);
    const end = moment(`${moment().year()}-12-31`);

    // Generate a random date between start and end
    const randomDate = moment(start).add(
      Math.random() * end.diff(start),
      "milliseconds"
    );

    if (email) {
      try {
        const created = await createUser({
          password: moment(randomDate).format("DDMMMMYYYY"),
          fullname: fullname ?? "",
          email: email ?? "",
          phone: phone ?? "",
          dateofbirth: dateofbirth ?? "",
          leader,
          createdBy,
        });

        if (created) {
          await sendMailer({
            send: email,
            subject: `${fullname} akun berhasil dibuat.`,
            html: `<html>
                <span>berhasil ${moment(randomDate).format("DDMMMMYYYY")}</span>
              </html>`,
          });
        } else {
          throw new Error("Try again later.");
        }
      } catch (error: any) {
        throw new Error(error.message);
      }
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
};
//endregion

//region action all user
const paginationUser = async ({
  take,
  skip,
}: {
  take: number;
  skip: number;
}) => {
  try {
    const data = await paginationListUser({ take, skip });

    return data;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const roleUser = async () => {
  try {
    const data = await listRole();

    return data;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const addRoles = async ({
  id,
  idRole,
  idEdit,
}: {
  id: string;
  idRole: string;
  idEdit: string;
}) => {
  try {
    const data = await addRole({ id, idRole, idEdit });

    return data;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const deleteRoles = async ({ id, idRole }: { id: string; idRole: string }) => {
  try {
    const data = await deleteRole({ id, idRole });

    return data;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const searchUsers = async ({ searchText }: { searchText: string }) => {
  try {
    const data = await searchUser({ findSearch: searchText });

    return data;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const disableUsers = async ({
  updatedBy,
  disable,
  idEdit,
}: {
  idEdit?: string;
  updatedBy?: string;
  disable?: boolean;
}) => {
  try {
    const data = await disableUser({ updatedBy, idEdit, disable });

    return data;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const updateUsers = async ({
  updatedBy,
  idEdit,
  fullname,
  phone,
  email,
  bod,
  leader,
}: {
  idEdit?: string;
  updatedBy?: string;
  fullname?: string;
  phone?: string;
  email?: string;
  bod?: string;
  leader?: string;
}) => {
  try {
    const data = await updateUser({
      updatedBy,
      fullname,
      phone,
      email,
      bod,
      leader,
      idEdit,
    });

    return data;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

//endregion
export {
  login,
  logout,
  userRoles,
  createInternalUser,
  paginationUser,
  roleUser,
  addRoles,
  deleteRoles,
  updateUsers,
  searchUsers,
  disableUsers,
};

//region Product
const listUnits = async () => {
  try {
    const data = await listUnit();

    return _.map(data, (o) => ({ value: o.name, label: o.name }));
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const addProducts = async ({
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
    throw new Error(error.message);
  }
};

const paginationProduct = async ({
  take,
  skip,
}: {
  take: number;
  skip: number;
}) => {
  try {
    const data = await paginationListProduct({ take, skip });

    return data;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const downloadProducts = async () => {
  try {
    const data = await downloadProduct();

    return data;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const uploadProduct = async ({ data }: { data: any }) => {
  try {
    const productUpload = await batchUploadProduct({ data });

    return productUpload;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const searchProducts = async ({ searchText }: { searchText: string }) => {
  try {
    const data = await searchProduct({ findSearch: searchText });

    return data;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

//endRegion
export {
  listUnits,
  addProducts,
  paginationProduct,
  downloadProducts,
  uploadProduct,
  searchProducts,
};

const listProducts = async () => {
  try {
    const data = await listProduct();

    return _.map(data, (o) => ({
      value: o.productId,
      label: `${o.productCode} - ${o.productName}`,
    }));
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const addCampaigns = async ({
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
    throw new Error(error.message);
  }
};

const paginationCampaign = async ({
  take,
  skip,
}: {
  take: number;
  skip: number;
}) => {
  try {
    const data = await paginationListCampaign({ take, skip });

    return data;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export { listProducts, addCampaigns, paginationCampaign };
