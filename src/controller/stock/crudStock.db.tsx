import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";
import _ from "lodash";

const prisma = new PrismaClient();

export interface LocationStock {
  labelingBox: string;
  location: string;
  updatedBy: string;
}

export async function addLocationStock({
  labelingBox,
  location,
  updatedBy,
}: LocationStock) {
  try {
    return prisma.$transaction(async (tx) => {
      const updateLocation = await tx.stokopname.updateMany({
        where: { labelingBox: labelingBox },
        data: {
          location: location ?? null,
          status: 6,
          updatedBy,
        },
      });

      return updateLocation;
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}
