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
}

export function createUser({
  email,
  password,
  phone,
  dateofbirth,
  leader,
  fullname,
  createdBy,
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
        },
      });

      return userCreate;
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}
