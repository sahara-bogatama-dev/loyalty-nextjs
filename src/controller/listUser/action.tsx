"use server";

import { listAllUser } from "./listUser.db";
import {
  addRole,
  currentRole,
  deleteRole,
  listRole,
  listRoleMobile,
} from "./listRole.db";
import { updateUser } from "./crudUser.db";
import { createServerAction, ServerActionError } from "@/lib/action-utils";
import { userDetail } from "../userDetail/userDetail.db";
import _ from "lodash";
import dayjs from "dayjs";
import { createUser } from "../register/register.db";
import sendMailer from "@/lib/node.mailer";

//region list User
const userRoles = createServerAction(async ({ id }: { id: string }) => {
  try {
    const detail = await userDetail({ id });

    return _.map(detail?.role, (o) => ({ role: o.id }));
  } catch (error: any) {
    throw new ServerActionError(error.message);
  }
});

const createInternalUser = createServerAction(
  async ({
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
      const start = dayjs(`2000-01-01`);
      const end = dayjs(`${dayjs().year()}-12-31`);

      const randomDate = dayjs(start).add(
        Math.random() * end.diff(start),
        "milliseconds"
      );

      if (email) {
        try {
          const created = await createUser({
            password: dayjs(randomDate).format("DDMMMMYYYY"),
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
                  <span>berhasil ${dayjs(randomDate).format(
                    "DDMMMMYYYY"
                  )}</span>
                </html>`,
            });

            return created;
          } else {
            throw new ServerActionError("Try again later.");
          }
        } catch (error: any) {
          throw new ServerActionError(error.message);
        }
      }
    } catch (error: any) {
      throw new ServerActionError(error.message);
    }
  }
);

const roleUser = createServerAction(async () => {
  try {
    const data = await listRole();

    return data;
  } catch (error: any) {
    throw new ServerActionError(error.message);
  }
});

const roleUserMobile = createServerAction(async () => {
  try {
    const data = await listRoleMobile();

    return data;
  } catch (error: any) {
    throw new ServerActionError(error.message);
  }
});

const currentRoleUser = createServerAction(
  async ({ userId }: { userId: string }) => {
    try {
      const data = await currentRole({ userId });

      return data;
    } catch (error: any) {
      throw new ServerActionError(error.message);
    }
  }
);

const addRoles = createServerAction(
  async ({
    userId,
    idRole,
    createdBy,
  }: {
    userId: string;
    idRole: string;
    createdBy: string;
  }) => {
    try {
      const data = await addRole({ id: userId, idRole, createdBy });

      return data;
    } catch (error: any) {
      throw new ServerActionError(error.message);
    }
  }
);

const deleteRoles = createServerAction(
  async ({ id, idRole }: { id: string; idRole: string }) => {
    try {
      const data = await deleteRole({ id, idRole });

      return data;
    } catch (error: any) {
      throw new ServerActionError(error.message);
    }
  }
);

const updateUsers = createServerAction(
  async ({
    updatedBy,
    userId,
    fullname,
    phone,
    email,
    bod,
    leader,
    inActive,
  }: {
    userId?: string;
    updatedBy?: string;
    fullname?: string;
    phone?: string;
    email?: string;
    bod?: string;
    leader?: string;
    inActive?: boolean;
  }) => {
    try {
      const data = await updateUser({
        updatedBy,
        fullname,
        phone,
        email,
        bod,
        leader,
        userId,
        inActive,
      });

      return data;
    } catch (error: any) {
      throw new ServerActionError(error.message);
    }
  }
);

const allUserData = createServerAction(async () => {
  try {
    const data = await listAllUser();

    return data;
  } catch (error: any) {
    throw new ServerActionError(error.message);
  }
});

export {
  userRoles,
  createInternalUser,
  roleUser,
  addRoles,
  deleteRoles,
  updateUsers,
  allUserData,
  currentRoleUser,
  roleUserMobile,
};
//endregion
