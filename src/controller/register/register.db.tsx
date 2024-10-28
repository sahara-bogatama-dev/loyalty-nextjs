import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

interface CreeteUser {
  email: string;
  password: string;
  phone: string;
  dateofbirth: string;
  leader?: string;
  fullname: string;
  createdBy?: string;
  mobile?: boolean;
  idRole?: string;
}

export function createUser({
  email,
  password,
  phone,
  dateofbirth,
  leader,
  fullname,
  createdBy,
  mobile,
  idRole,
}: CreeteUser) {
  try {
    return prisma.$transaction(async (tx) => {
      const checkEmal = await tx.user.findFirst({
        where: { email },
      });

      const checkUsername = await tx.user.findFirst({
        where: { username: email.split("@")[0] },
      });

      if (checkUsername) {
        throw new Error(`Username ${checkUsername.username} already exist.`);
      } else if (checkEmal) {
        throw new Error(`Email ${checkEmal.email} already exist.`);
      }

      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password, salt);

      const stringMap = await tx.stringMap.findUnique({
        where: { id: idRole },
      });

      if (stringMap) {
        const userCreate = await tx.user.create({
          data: {
            email,
            username: email.split("@")[0],
            password: hash,
            name: fullname,
            dateOfBirth: dateofbirth,
            phone,
            leader,
            createdBy,
            inMobile: mobile,
            role: {
              create: {
                id: stringMap.id,
                name: stringMap.name,
              },
            },
          },
        });

        return userCreate;
      } else {
        throw new Error(`Role yang di daftarkan tidak ada.`);
      }
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function forgotPasasUser({
  email,
  password,
}: {
  email?: string;
  password: string;
}) {
  try {
    return prisma.$transaction(async (tx) => {
      const searchUser = await tx.user.findFirst({
        where: {
          email,
        },
      });

      console.log(searchUser);

      if (searchUser) {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);

        const update = await tx.user.update({
          where: { id: searchUser.id },
          data: {
            password: hash,
          },
        });

        return update;
      } else {
        throw new Error(`Akun tidak ditemukan.`);
      }
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}
