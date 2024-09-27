import { PrismaClient } from "@prisma/client";
import _ from "lodash";

const prisma = new PrismaClient();

export interface BoothOwner {
  boothId?: string;
  userId: string;
  address: string;
  dateEstablishment: string;
  ig: string;
  fb: string;
  ecm: string;
  geolocation: string;
  createdBy?: string;
  updatedBy?: any;
}

export interface BoothMember {
  boothId: string;
  boothMemberId?: string;
  userId: string;
  address: string;
  photo: any;
  geolocation: string;
  createdBy?: string;
  updatedBy?: any;
}

export async function addBoothOwner({
  userId,
  address,
  dateEstablishment,
  ig,
  fb,
  ecm,
  geolocation,
  createdBy,
}: BoothOwner) {
  try {
    return prisma.$transaction(async (tx) => {
      const findUserExist = await tx.user.findUnique({ where: { id: userId } });

      if (findUserExist) {
        const create = await tx.boothOwner.create({
          data: {
            fullname: findUserExist.name,
            userId: findUserExist.id,
            address,
            email: findUserExist.email,
            phone: findUserExist.phone,
            dateEstablishment,
            instagram: ig,
            facebook: fb,
            ecommerce: ecm,
            geolocation,
            createdBy,
          },
        });

        return { create };
      }
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function searchUser({ findSearch }: { findSearch?: string }) {
  try {
    return prisma.$transaction(async (tx) => {
      const search = await tx.user.findMany({
        where: {
          OR: [
            { name: { contains: findSearch } },
            { email: { contains: findSearch } },
            { phone: { contains: findSearch } },
          ],
        },
        orderBy: { createdAt: "asc" },
      });

      return search;
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function addBoothMember({
  userId,
  address,
  boothId,
  photo,
  geolocation,
  createdBy,
}: BoothMember) {
  try {
    return prisma.$transaction(async (tx) => {
      const findUserExist = await tx.user.findUnique({ where: { id: userId } });

      if (findUserExist) {
        const create = await tx.booth.create({
          data: {
            boothId,
            fullname: findUserExist.name,
            userId: findUserExist.id,
            address,
            email: findUserExist.email,
            phone: findUserExist.phone,
            photoBooth: photo,
            geolocation,
            createdBy,
          },
        });

        return { create };
      }
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function boothImage({ boothMemberId }: { boothMemberId: string }) {
  try {
    const [result] = await prisma.$transaction([
      prisma.booth.findUnique({ where: { boothMemberId } }),
    ]);

    return result;
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function searchBooth({ findSearch }: { findSearch?: string }) {
  try {
    return prisma.$transaction(async (tx) => {
      const search = await tx.boothOwner.findMany({
        where: {
          OR: [
            { fullname: { contains: findSearch } },
            { email: { contains: findSearch } },
            { phone: { contains: findSearch } },
          ],
        },
        orderBy: { createdAt: "asc" },
      });

      return search;
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function deleteBooth({
  boothMemberId,
}: {
  boothMemberId?: string;
}) {
  try {
    return prisma.$transaction(async (tx) => {
      const deletes = await tx.booth.delete({
        where: { boothMemberId },
      });

      return deletes;
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function updateOwner({
  userId,
  address,
  dateEstablishment,
  ig,
  fb,
  ecm,
  geolocation,
  boothId,
  updatedBy,
}: BoothOwner) {
  try {
    return prisma.$transaction(async (tx) => {
      const updates = await tx.boothOwner.update({
        where: { boothId },
        data: {
          address,
          dateEstablishment,
          instagram: ig,
          facebook: fb,
          ecommerce: ecm,
          geolocation,
          updatedBy,
        },
      });

      return updates;
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function updateBooth({
  address,
  photo,
  geolocation,
  boothMemberId,
  updatedBy,
}: BoothMember) {
  try {
    return prisma.$transaction(async (tx) => {
      const updates = await tx.booth.update({
        where: { boothMemberId },
        data: {
          address,
          photoBooth: photo,
          geolocation,
          updatedBy,
        },
      });

      return updates;
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}
