"use server";

import { createServerAction, ServerActionError } from "@/lib/action-utils";
import _ from "lodash";
import { runningNumber } from "./running.db";

const getRunningNumber = createServerAction(async () => {
  try {
    const running = await runningNumber();

    return running;
  } catch (error: any) {
    throw new ServerActionError(error.message);
  }
});

export { getRunningNumber };
