import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

interface UserLogin {
  email: string;
  password: string;
}

export async function userLogin({ email, password }: UserLogin) {
  try {
    return prisma.$transaction(async (tx) => {
      const checkUser = await tx.user.findFirst({
        where: {
          OR: [{ email: email }, { username: email.split("@")[0] }],
        },
      });

      if (checkUser === null) {
        throw new Error("Account not found.");
      }

      if (!checkUser.password) {
        throw new Error("Password not found.");
      }

      const matchPassword = await bcrypt.compare(password, checkUser.password);

      if (!matchPassword) {
        throw new Error("Password incorrect.");
      }

      if (checkUser.inActive) {
        throw new Error("Your account inActive, please contact sahara");
      }

      return checkUser;
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}
