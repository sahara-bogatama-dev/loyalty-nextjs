import { PrismaClient } from "@prisma/client";
import _ from "lodash";

const prisma = new PrismaClient();

export async function listDataOwner() {
  try {
    const [result] = await prisma.$transaction([
      prisma.boothOwner.findMany({
        orderBy: { createdAt: "asc" },
        include: {
          _count: {
            select: { boothMember: true },
          },
        },
      }),
    ]);

    const formattedResult = _.map(result, (owner) =>
      _.assign(owner, { totalMember: _.get(owner, "_count.boothMember", 0) })
    );

    return { result: formattedResult };
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function listDataMember({ boothId }: { boothId: string }) {
  try {
    const [result] = await prisma.$transaction([
      prisma.booth.findMany({
        where: { boothId },
        orderBy: { createdAt: "asc" },
        select: {
          boothMemberId: true,
          address: true,
          geolocation: true,
          email: true,
          fullname: true,
          phone: true,
          userId: true,
          boothId: true,
          createdBy: true,
          updatedBy: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    return { result };
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}
