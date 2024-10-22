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
          cc: "gie.posh@gmail.com, rizal.rizarudesu@yahoo.com",
          subject: `Approvemeent clim reedeem`,
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
    return prisma.$transaction(async (tx) => {
      const checkAvaiablePackage = await tx.packageRedeem.findUnique({
        where: { packageId },
      });

      if (checkAvaiablePackage) {
        const summaryRedeem = await tx.redeem.findMany({
          where: { packageId },
        });

        if (checkAvaiablePackage.limit === _.size(summaryRedeem)) {
          throw new Error(`Package Redeem limit sudah mencapai batas`);
        } else {
          const redeemPackage = await tx.redeem.create({
            data: {
              userId,
              agentId,
              packageId: checkAvaiablePackage.packageId,
              packageName: checkAvaiablePackage.packageName,
              redeemCode: redeemCode ?? "",
              status: 1,
              createdBy,
            },
          });

          if (redeemPackage) {
            const findAgentEmail = await tx.agent.findUnique({
              where: { agentId },
            });
            const findCurrentPoint = await tx.pointLoyalty.findFirst({
              where: { userId },
            });

            if (findCurrentPoint) {
              const updatePoint = await tx.pointLoyalty.update({
                where: {
                  pointId: findCurrentPoint.pointId,
                },
                data: {
                  point: { decrement: checkAvaiablePackage.costPoint },
                  updatedBy: createdBy,
                  log: {
                    create: {
                      userId: userId ?? "",
                      point: checkAvaiablePackage.costPoint,
                      createdBy,
                      status: 3,
                    },
                  },
                },
              });

              if (updatePoint) {
                return { updatePoint, redeemPackage, findAgentEmail };
              } else {
                throw new Error(`Gagal meredeem package.`);
              }
            }
          } else {
            throw new Error(`Point user tidak di temukan.`);
          }
        }
      } else {
        throw new Error(`Package Redeem tidak ditemukan`);
      }
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}
