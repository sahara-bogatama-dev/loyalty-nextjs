"use server";

import _ from "lodash";

import { createServerAction, ServerActionError } from "@/lib/action-utils";
import { listRedeemAgent } from "./listRedeem.db";
import { approveRedeemAgent, Redeems } from "./crudRedeem.db";

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

export { listDataRedeem, approveRedeem };
//endregion
