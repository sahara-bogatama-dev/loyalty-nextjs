import { PrismaClient } from "@prisma/client";
import _, { add } from "lodash";
import bcrypt from "bcryptjs";
import dayjs from "dayjs";

const prisma = new PrismaClient();

export interface Agents {
  agentId?: string;
  customerName?: string;
  picName?: string;
  phone?: string;
  picPhone?: string;
  email?: string;
  noNpwp?: string;
  storeAddress?: string;
  createdBy?: string;
  updatedBy?: string;
}

export async function addAgent({
  noNpwp,
  email,
  phone,
  picName,
  picPhone,
  customerName,
  createdBy,
  storeAddress,
}: Agents) {
  try {
    // Check if email or username already exists before transaction
    const checkEmail = await prisma.user.findFirst({ where: { email } });
    const checkUsername = await prisma.user.findFirst({
      where: { username: (email ?? "").split("@")[0] },
    });
    const stringMap = await prisma.stringMap.findUnique({
      where: { id: "cm34nvwf700000cl60ggl8ghi" },
    });

    if (checkUsername) {
      throw new Error(`Username ${checkUsername.username} already exists.`);
    } else if (checkEmail) {
      throw new Error(`Email ${checkEmail.email} already exists.`);
    } else if (!stringMap) {
      throw new Error(`StringMap not found.`);
    }

    return prisma.$transaction(async (tx) => {
      const addAgent = await tx.agent.create({
        data: {
          customerName: customerName ?? "",
          createdBy,
          picName: picName ?? "",
          phone: phone ?? "",
          picPhone: picPhone ?? "",
          email: email ?? "",
          noNpwp,
          storeAddress: storeAddress ?? "",
        },
      });

      const start = dayjs("2000-01-01");
      const end = dayjs(`${dayjs().year()}-12-31`);
      const randomDate = start.add(
        Math.random() * end.diff(start),
        "milliseconds"
      );

      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(
        dayjs(randomDate).format("DDMMMMYYYY"),
        salt
      );

      await tx.user.create({
        data: {
          email,
          username: addAgent.email.split("@")[0],
          password: hash,
          name: addAgent.customerName,
          dateOfBirth: dayjs().format("DD-MM-YYYY"),
          phone,
          createdBy,
          role: {
            create: {
              id: stringMap.id,
              name: stringMap.name,
            },
          },
        },
      });

      return { addAgent, password: dayjs(randomDate).format("DDMMMMYYYY") };
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function updateAgent({
  noNpwp,
  email,
  phone,
  picName,
  picPhone,
  customerName,
  updatedBy,
  agentId,
  storeAddress,
}: Agents) {
  try {
    return prisma.$transaction(async (tx) => {
      const updateData: any = {};
      if (customerName) updateData.customerName = customerName;
      if (picName) updateData.picName = picName;
      if (phone) updateData.phone = phone;
      if (picPhone) updateData.picPhone = picPhone;
      if (email) updateData.email = email;
      if (noNpwp) updateData.noNpwp = noNpwp;
      if (storeAddress) updateData.storeAddress = storeAddress;

      updateData.updatedBy = updatedBy;

      const addAgent = await tx.agent.update({
        where: { agentId },
        data: updateData,
      });

      return addAgent;
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}

export async function deleteAgent({ agentId }: { agentId: string }) {
  try {
    return prisma.$transaction(async (tx) => {
      const deletedAgent = await tx.agent.delete({
        where: {
          agentId,
        },
      });

      return deletedAgent;
    });
  } catch (error: any) {
    throw new Error(`Error ${error.message}`);
  }
}
