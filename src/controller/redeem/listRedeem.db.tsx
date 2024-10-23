import { PrismaClient } from "@prisma/client";
import _ from "lodash";

const prisma = new PrismaClient();

export async function listRedeemAgent({ email }: { email: string }) {
  try {
    return prisma.$transaction(async (tx) => {
      const findAgent = await tx.agent.findFirst({ where: { email } });

      if (findAgent) {
        const data = await tx.redeem.findMany({
          where: { agentId: findAgent?.agentId },
        });

        const statusMap = await tx.stringMap.findMany({
          where: { objectName: "Redeem Status" },
        });

        const colorMap = {
          2: "green",
          3: "magenta",
          1: "geekblue",
        } as any;

        return data.map((item) => {
          const match = _.find(statusMap, { key: item.status });
          const statusColor = colorMap[item.status] || "gray";

          return {
            ...item,
            statusCode: item.status,
            status: match ? match.name : "Unknown",
            statusColor,
          };
        });
      } else {
        return [];
      }
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function listMyRedeem({ userId }: { userId: string }) {
  try {
    return prisma.$transaction(async (tx) => {
      const data = await tx.redeem.findMany({
        where: { userId },
      });

      const statusMap = await tx.stringMap.findMany({
        where: { objectName: "Redeem Status" },
      });

      const colorMap = {
        2: "green",
        3: "magenta",
        1: "geekblue",
      } as any;

      return data.map((item) => {
        const match = _.find(statusMap, { key: item.status });
        const statusColor = colorMap[item.status] || "gray";

        return {
          ...item,
          statusCode: item.status,
          status: match ? match.name : "Unknown",
          statusColor,
        };
      });
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}
