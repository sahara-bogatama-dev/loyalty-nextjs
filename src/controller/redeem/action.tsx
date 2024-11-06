"use server";

import _ from "lodash";

import { createServerAction, ServerActionError } from "@/lib/action-utils";
import { listMyRedeem, listRedeemAgent } from "./listRedeem.db";
import { approveRedeemAgent, exchangePoints, Redeems } from "./crudRedeem.db";
import sendMailer from "@/lib/node.mailer";
import { redeemPackage } from "@/app/component/templateEmail.comp";

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

const listDataMyRedeem = createServerAction(
  async ({ userId }: { userId: string }) => {
    try {
      const data = await listMyRedeem({ userId });

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
          cc: `${data.findAgentEmail?.email}, no-reply@sahara.com`,
          subject: `Exchange Code Approval for ${data?.redeemPackage?.packageName}`,
          html: redeemPackage({
            fullname: data?.redeemPackage?.fullname ?? "",
            packageName: data?.redeemPackage?.packageName ?? "",
            agentName: data?.findAgentEmail?.customerName ?? "",
            agentPICName: data?.findAgentEmail?.picName ?? "",
            agentPhone: data?.findAgentEmail?.phone ?? "",
            agentPICPhone: data?.findAgentEmail?.picPhone ?? "",
            agentAddress: data?.findAgentEmail?.storeAddress ?? "",
          }),
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

export { listDataRedeem, approveRedeem, exchangePointUser, listDataMyRedeem };
//endregion
