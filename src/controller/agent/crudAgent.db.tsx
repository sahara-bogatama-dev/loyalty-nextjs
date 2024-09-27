import { PrismaClient } from "@prisma/client";
import _ from "lodash";

const prisma = new PrismaClient();

export interface Agents {
  agentId?: string;
  customerName: string;
  picName: string;
  phone: string;
  picPhone: string;
  email: string;
  noNpwp?: string;
  storeAddress: string;
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
          customerName,
          createdBy,
          picName,
          phone,
          picPhone,
          email,
          noNpwp,
          storeAddress,
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
      const addAgent = await tx.agent.update({
        where: {
          agentId,
        },
        data: {
          customerName,
          updatedBy,
          picName,
          phone,
          picPhone,
          email,
          noNpwp,
          storeAddress,
        },
      });

      return addAgent;
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function searchAgent({ findSearch }: { findSearch?: string }) {
  try {
    return prisma.$transaction(async (tx) => {
      const searchAgent = await tx.agent.findMany({
        where: {
          OR: [
            { customerName: { contains: findSearch } },
            { noNpwp: { contains: findSearch } },
            { email: { contains: findSearch } },
          ],
        },
        orderBy: { createdAt: "asc" },
      });

      return searchAgent;
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function downloadAgent() {
  try {
    return prisma.$transaction(async (tx) => {
      const agentList = await tx.agent.findMany();

      return agentList;
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
