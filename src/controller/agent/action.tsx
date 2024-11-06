"use server";

import { createServerAction, ServerActionError } from "@/lib/action-utils";
import _ from "lodash";

import { addAgent, Agents, deleteAgent, updateAgent } from "./crudAgent.db";
import { listAgent } from "./listAgent.db";
import sendMailer from "@/lib/node.mailer";

//region agent
const addAgents = createServerAction(
  async ({
    noNpwp,
    email,
    phone,
    picName,
    picPhone,
    customerName,
    createdBy,
    storeAddress,
  }: Agents) => {
    try {
      const data = await addAgent({
        noNpwp,
        email,
        phone,
        picName,
        picPhone,
        customerName,
        createdBy,
        storeAddress,
      });

      await sendMailer({
        send: data.addAgent.email ?? "",
        subject: `${data.addAgent.customerName} Sudah teerdaftar`,
        html: `<html>
                  <span> Pass ${data.password}</span>
                </html>`,
      });

      return data.addAgent;
    } catch (error: any) {
      throw new ServerActionError(error.message);
    }
  }
);

const updateAgents = createServerAction(
  async ({
    agentId,
    noNpwp,
    email,
    phone,
    picName,
    picPhone,
    customerName,
    updatedBy,
    storeAddress,
  }: Agents) => {
    try {
      const data = await updateAgent({
        agentId,
        noNpwp,
        email,
        phone,
        picName,
        picPhone,
        customerName,
        updatedBy,
        storeAddress,
      });

      return data;
    } catch (error: any) {
      throw new ServerActionError(error.message);
    }
  }
);

const listDataAgent = createServerAction(async () => {
  try {
    const data = await listAgent();

    return data;
  } catch (error: any) {
    throw new ServerActionError(error.message);
  }
});

const deleteAgents = createServerAction(
  async ({ idAgent }: { idAgent: string }) => {
    try {
      const data = await deleteAgent({ agentId: idAgent });

      return data;
    } catch (error: any) {
      throw new ServerActionError(error.message);
    }
  }
);

export { addAgents, listDataAgent, updateAgents, deleteAgents };
//endregion
