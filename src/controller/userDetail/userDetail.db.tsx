import { PrismaClient } from "@prisma/client";
import _ from "lodash";

const prisma = new PrismaClient();

interface Users {
  id: string;
}

export function userDetail({ id }: Users) {
  if (!id) {
    throw new Error("User ID cannot be empty");
  }

  try {
    return prisma.$transaction(async (tx) => {
      const users = await tx.user.findUnique({
        where: { id },
        include: { role: true },
      });

      if (!users) {
        throw new Error("User not found");
      }

      return users;
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export function validateMobile({ id }: Users) {
  try {
    return prisma.$transaction(async (tx) => {
      const users = await tx.user.findUnique({
        where: { id },
      });

      if (users?.inMobile) {
        return users;
      } else {
        throw new Error(
          `Account ini tidak bisa akses mobile apps, silahkan hubungi CS Sahara`
        );
      }
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}
