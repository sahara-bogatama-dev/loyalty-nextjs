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
