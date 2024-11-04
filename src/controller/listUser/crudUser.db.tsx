import { PrismaClient } from "@prisma/client";
import _ from "lodash";
import moment from "moment";

const prisma = new PrismaClient();

export async function updateUser({
  updatedBy,
  userId,
  fullname,
  phone,
  email,
  bod,
  leader,
  inActive,
  inMobile,
}: {
  userId?: string;
  updatedBy?: string;
  fullname?: string;
  phone?: string;
  email?: string;
  bod?: string;
  leader?: string;
  inActive?: boolean;
  inMobile?: boolean;
}) {
  try {
    return prisma.$transaction(async (tx) => {
      const updateData: any = {};
      if (fullname) updateData.name = fullname;
      if (phone) updateData.phone = phone;
      if (email) updateData.email = email;
      if (bod) updateData.dateOfBirth = bod;
      if (leader) updateData.leader = leader;
      if (inActive !== undefined) updateData.inActive = inActive;
      if (inMobile !== undefined) updateData.inMobile = inMobile;

      updateData.updatedBy = updatedBy;

      const updateUser = await tx.user.update({
        where: { id: userId },
        data: updateData,
      });

      return updateUser;
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function disableUser({
  updatedBy,
  disable,
  idEdit,
}: {
  updatedBy?: string;
  idEdit?: string;
  disable?: boolean;
}) {
  try {
    return prisma.$transaction(async (tx) => {
      const updateUser = await tx.user.update({
        where: { id: idEdit },
        data: { inActive: disable, updatedBy: updatedBy },
      });

      return updateUser;
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function verificationEmailUser({
  updatedBy,
  verification,
  idEdit,
}: {
  updatedBy?: string;
  idEdit?: string;
  verification?: boolean;
}) {
  try {
    return prisma.$transaction(async (tx) => {
      // Perform the update
      const updateUser = await tx.user.update({
        where: { id: idEdit },
        data: {
          emailVerified: verification ? moment().toDate() : null,
          updatedBy: updatedBy,
        },
      });

      return updateUser;
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function searchUser({ findSearch }: { findSearch?: string }) {
  try {
    return prisma.$transaction(async (tx) => {
      const searchUser = await tx.user.findMany({
        where: {
          OR: [
            { name: { contains: findSearch } },
            { email: { contains: findSearch } },
          ],
        },
      });

      return searchUser;
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}
