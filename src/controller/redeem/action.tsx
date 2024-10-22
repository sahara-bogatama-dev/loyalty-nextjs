"use server";

import _ from "lodash";

import { createServerAction, ServerActionError } from "@/lib/action-utils";
import { listRedeemAgent } from "./listRedeem.db";
import { approveRedeemAgent, exchangePoints, Redeems } from "./crudRedeem.db";
import sendMailer from "@/lib/node.mailer";

//region labelng product
const listDataRedeem = createServerAction(
  async ({ email }: { email: string }) => {
    try {
      const data = await listRedeemAgent({ email });

      return data;
    } catch (error: any) {
      throw new ServerActionError(error.message);
    }
  }
);

const approveRedeem = createServerAction(
  async ({ redeemId, updatedBy }: Redeems) => {
    try {
      const data = await approveRedeemAgent({ redeemId, updatedBy });

      return data;
    } catch (error: any) {
      throw new ServerActionError(error.message);
    }
  }
);

const exchangePointUser = createServerAction(
  async ({ packageId, createdBy, userId, agentId, redeemCode }: Redeems) => {
    try {
      const data = await exchangePoints({
        packageId,
        createdBy,
        userId,
        agentId,
        redeemCode,
      });

      if (data) {
        await sendMailer({
          send: data?.redeemPackage?.email ?? "",
          cc: `${data.findAgentEmail?.email ?? ""}, no-reply@sahara.com`,
          subject: `${data?.redeemPackage?.fullname} sudah melalukan tukar point.`,
          html: `<html>
                  <span>${redeemCode}</span>
                </html>`,
        });
        return data;
      } else {
        throw new ServerActionError("Try again later.");
      }
    } catch (error: any) {
      throw new ServerActionError(error.message);
    }
  }
);

export { listDataRedeem, approveRedeem, exchangePointUser };
//endregion
