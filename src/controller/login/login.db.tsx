import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

interface UserLogin {
  email: string;
  password: string;
}

export function userLogin({ email, password }: UserLogin) {
  try {
    return prisma.$transaction(async (tx) => {
      const checkUser = await tx.user.findFirst({
        where: {
          OR: [{ email: email }, { username: email.split("@")[0] }],
        },
      });

      if (checkUser && checkUser.password) {
        const matchPassword = await bcrypt.compare(
          password,
          checkUser.password
        );

        if (matchPassword) {
          if (!checkUser.inActive) {
            return checkUser;
          } else {
            throw new Error("Your account inActive, please contact sahara");
          }
        } else {
          throw new Error("Password incorrect.");
        }
      } else {
        throw new Error("Account not found.");
      }
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}
