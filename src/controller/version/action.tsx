"use server";

import { createServerAction, ServerActionError } from "@/lib/action-utils";
import { versionApps } from "./version.db";

//region agent
const versionMobile = createServerAction(async () => {
  try {
    const data = await versionApps();

    return data;
  } catch (error: any) {
    throw new ServerActionError(error.message);
  }
});

export { versionMobile };
//endregion
