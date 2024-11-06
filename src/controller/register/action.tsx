"use server";

import { createServerAction, ServerActionError } from "@/lib/action-utils";
import _ from "lodash";
import dayjs from "dayjs";
import { changePassword, forgotPasasUser } from "../register/register.db";
import sendMailer from "@/lib/node.mailer";
import { forgotPassword } from "@/app/component/templateEmail.comp";

const forgotUser = createServerAction(async ({ email }: { email?: string }) => {
  try {
    const start = dayjs(`2000-01-01`);
    const end = dayjs(`${dayjs().year()}-12-31`);

    const randomDate = dayjs(start).add(
      Math.random() * end.diff(start),
      "milliseconds"
    );

    if (email) {
      const created = await forgotPasasUser({
        email: email,
        password: dayjs(randomDate).format("DDMMMMYYYY"),
      });

      if (created) {
        await sendMailer({
          send: created.email ?? "",
          subject: "Password Reset Request",
          html: forgotPassword({
            fullname: created.name ?? "",
            username: created.email ?? "",
            password: dayjs(randomDate).format("DDMMMMYYYY"),
          }),
        });

        return created;
      } else {
        throw new ServerActionError("Try again later.");
      }
    }
  } catch (error: any) {
    throw new ServerActionError(error.message);
  }
});

const changePasswords = createServerAction(
  async ({
    userId,
    password,
    updatedBy,
  }: {
    userId: string;
    password: string;
    updatedBy: string;
  }) => {
    try {
      const updatedPass = await changePassword({
        userId,
        password,
        updatedBy,
      });

      return updatedPass;
    } catch (error: any) {
      throw new ServerActionError(error.message);
    }
  }
);

export { forgotUser, changePasswords };
