import { PrismaClient } from "@prisma/client";
import _ from "lodash";

const prisma = new PrismaClient();

export async function listRole() {
  try {
    const [result] = await prisma.$transaction([
      prisma.stringMap.findMany({
        where: { objectName: "Roles" },
        select: {
          id: true,
          name: true,
        },
        orderBy: { name: "asc" },
      }),
    ]);

    return { result };
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function addRole({
  id,
  idRole,
  idEdit,
}: {
  id: string;
  idRole: string;
  idEdit: string;
}) {
  try {
    return prisma.$transaction(async (tx) => {
      const stringMap = await tx.stringMap.findUnique({
        where: { id: idRole },
      });

      if (stringMap) {
        const existRole = await tx.role.findFirst({ where: { id: idRole } });
        const createdBy = await tx.user.findUnique({ where: { id } });

        if (!existRole) {
          const addRole = await tx.role.create({
            data: {
              id: stringMap.id,
              name: stringMap.name,
              userId: idEdit,
              createdBy: createdBy?.name ?? "bySystem",
            },
          });

          return addRole;
        } else {
          throw new Error("Role sudah ditambakan.");
        }
      } else {
        throw new Error("Role tidak ditemukan.");
      }
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function deleteRole({
  id,
  idRole,
}: {
  id: string;
  idRole: string;
}) {
  try {
    return prisma.$transaction(async (tx) => {
      const deletedRoles = await tx.role.deleteMany({
        where: {
          id: idRole,
          userId: id,
        },
      });

      return deletedRoles;
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}
