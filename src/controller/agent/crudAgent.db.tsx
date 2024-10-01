import { PrismaClient } from "@prisma/client";
import _ from "lodash";

const prisma = new PrismaClient();

export interface Agents {
  agentId?: string;
  customerName?: string;
  picName?: string;
  phone?: string;
  picPhone?: string;
  email?: string;
  noNpwp?: string;
  storeAddress?: string;
  createdBy?: string;
  updatedBy?: string;
}
export async function addAgent({
  noNpwp,
  email,
  phone,
  picName,
  picPhone,
  customerName,
  createdBy,
  storeAddress,
}: Agents) {
  try {
    return prisma.$transaction(async (tx) => {
      const addAgent = await tx.agent.create({
        data: {
          customerName: customerName ?? "",
          createdBy,
          picName: picName ?? "",
          phone: phone ?? "",
          picPhone: picPhone ?? "",
          email: email ?? "",
          noNpwp,
          storeAddress: storeAddress ?? "",
        },
      });

      return addAgent;
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function updateAgent({
  noNpwp,
  email,
  phone,
  picName,
  picPhone,
  customerName,
  updatedBy,
  agentId,
  storeAddress,
}: Agents) {
  try {
    return prisma.$transaction(async (tx) => {
      const updateData: any = {};
      if (customerName) updateData.customerName = customerName;
      if (picName) updateData.picName = picName;
      if (phone) updateData.phone = phone;
      if (picPhone) updateData.picPhone = picPhone;
      if (email) updateData.email = email;
      if (noNpwp) updateData.noNpwp = noNpwp;
      if (storeAddress) updateData.storeAddress = storeAddress;

      updateData.updatedBy = updatedBy;

      const addAgent = await tx.agent.update({
        where: { agentId },
        data: updateData,
      });

      return addAgent;
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function deleteAgent({ agentId }: { agentId: string }) {
  try {
    return prisma.$transaction(async (tx) => {
      const deletedAgent = await tx.agent.delete({
        where: {
          agentId,
        },
      });

      return deletedAgent;
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}
