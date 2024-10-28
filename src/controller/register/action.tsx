"use server";

import { createServerAction, ServerActionError } from "@/lib/action-utils";
import _ from "lodash";
import dayjs from "dayjs";
import { forgotPasasUser } from "../register/register.db";
import sendMailer from "@/lib/node.mailer";

const forgotUser = createServerAction(async ({ email }: { email?: string }) => {
  try {
    const start = dayjs(`2000-01-01`);
    const end = dayjs(`${dayjs().year()}-12-31`);

    const randomDate = dayjs(start).add(
      Math.random() * end.diff(start),
      "milliseconds"
    );

    if (email) {
      try {
        const created = await forgotPasasUser({
          email: email,
          password: dayjs(randomDate).format("DDMMMMYYYY"),
        });

        if (created) {
          await sendMailer({
            send: created.email ?? "",
            subject: `${created.name} forgot successfuly.`,
            html: `<html>
                  <span>Temp Pass ${dayjs(randomDate).format(
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
});

export { forgotUser };
