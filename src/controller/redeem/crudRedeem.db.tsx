import sendMailer from "@/lib/node.mailer";
import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";
import _ from "lodash";

const prisma = new PrismaClient();

export interface Redeems {
  agentId?: string;
  redeemId?: string;
  createdBy?: string;
  updatedBy?: string;
  point?: number;
  packageId?: string;
  userId?: string;
  packageName?: string;
  redeemCode?: string;
}

export async function approveRedeemAgent({ redeemId, updatedBy }: Redeems) {
  try {
    return prisma.$transaction(async (tx) => {
      const claim = await tx.redeem.update({
        where: { redeemId },
        data: {
          status: 3,
          updatedBy,
        },
      });

      if (claim) {
        await sendMailer({
          send: claim.email ?? "",
          cc: "no-reply@saharabogatama.co.id",
          subject: `Request for Approval: Claim Redemption`,
          html: `<html>
              <span>Agent</span>
            </html>`,
        });
        return claim;
      } else {
        throw new Error(`Gagal approve.`);
      }
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}
export async function exchangePoints({
  packageId,
  createdBy,
  userId,
  agentId,
  redeemCode,
}: Redeems) {
  try {
    return await prisma.$transaction(async (tx) => {
      //Step 0: check if the user exist
      const checkAvailableUser = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!checkAvailableUser) {
        throw new Error(`User tidak ditemukan`);
      }

      // Step 1: Check if the package exists
      const checkAvailablePackage = await tx.packageRedeem.findUnique({
        where: { packageId },
      });
      if (!checkAvailablePackage) {
        throw new Error(`Package Redeem tidak ditemukan`);
      }

      // Step 2: Check if the redeem limit is reached
      const summaryRedeem = await tx.redeem.count({
        where: { packageId },
      });
      if (checkAvailablePackage.limit === summaryRedeem) {
        throw new Error(`Package Redeem limit sudah mencapai batas`);
      }

      // Step 3: Create redeem package entry
      const redeemPackage = await tx.redeem.create({
        data: {
          userId,
          agentId,
          email: checkAvailableUser?.email,
          fullname: checkAvailableUser?.name,
          phone: checkAvailableUser?.phone,
          packageId: checkAvailablePackage.packageId,
          packageName: checkAvailablePackage.packageName,
          redeemCode: redeemCode ?? "",
          status: 1,
          createdBy,
        },
      });

      // Step 4: Find agent email and user’s current points
      const findAgentEmail = await tx.agent.findUnique({
        where: { agentId },
      });
      const findCurrentPoint = await tx.pointLoyalty.findFirst({
        where: { userId },
      });
      if (!findCurrentPoint) {
        throw new Error(`Gagal Update Point`);
      }

      // Step 5: Update user points and add log
      const updatePoint = await tx.pointLoyalty.update({
        where: { pointId: findCurrentPoint.pointId },
        data: {
          point: { decrement: checkAvailablePackage.costPoint },
          updatedBy: createdBy,
          log: {
            create: {
              userId: userId ?? "",
              point: checkAvailablePackage.costPoint,
              createdBy,
              status: 3,
            },
          },
        },
      });

      return { updatePoint, redeemPackage, findAgentEmail };
    });
  } catch (error: any) {
    throw new Error(`Error: ${error.message}`);
  }
}
