"use server";

import _ from "lodash";

import { createServerAction, ServerActionError } from "@/lib/action-utils";

import { listDataMember, listDataOwner } from "./../booth/listBooth.db";

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

export { listOwner, listMember };
//endregion
