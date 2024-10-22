import { addPoints } from "@/controller/point/action";
import { exchangePointUser } from "@/controller/redeem/action";
import { auth } from "@/lib/auth";
import { addPointInSchema, exchangePointInSchema } from "@/lib/zod";
import _ from "lodash";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

const generateRedeemCode = (): string => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const codeLength = 12;

  return Array.from(
    { length: codeLength },
    () => characters[Math.floor(Math.random() * characters.length)]
  ).join("");
};

export const POST = auth(async function POST(req, ctx) {
  try {
    if (req.auth) {
      const json = await req.json();

      const { agentId, packageId } = await exchangePointInSchema.parseAsync(
        json
      );

      const createdBy = req.auth?.user?.name ?? "";

      const addExchange = await exchangePointUser({
        userId: req.auth.user?.id,
        packageId,
        createdBy,
        agentId,
        redeemCode: generateRedeemCode(),
      });

      if (addExchange.success) {
        return NextResponse.json(
          {
            message: "Redeem package berhasil.",
          },
          {
            status: 200,
          }
        );
      } else {
        return NextResponse.json(
          {
            message: addExchange.error,
          },
          {
            status: 200,
          }
        );
      }
    } else {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }
  } catch (error: any) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: error.issues },
        {
          status: 403,
        }
      );
    } else {
      return NextResponse.json(
        { message: error.message },
        {
          status: 403,
        }
      );
    }
  }
});