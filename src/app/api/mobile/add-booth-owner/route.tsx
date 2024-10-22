import { addBoothMembers, addBoothOwners } from "@/controller/booth/action";
import { auth } from "@/lib/auth";
import { boothMemberInSchema, boothOwnerInSchema } from "@/lib/zod";
import _ from "lodash";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export const POST = auth(async function POST(req, ctx) {
  try {
    if (req.auth) {
      const json = await req.json();

      const { address, dateEstablishment, ig, fb, ecm, geolocation } =
        await boothOwnerInSchema.parseAsync(json);

      const createdBy = req.auth?.user?.name ?? "";

      const addOwner = await addBoothOwners({
        userId: req.auth.user?.id as string,
        address,
        dateEstablishment,
        ig,
        fb,
        ecm,
        geolocation,
        createdBy,
      });

      if (addOwner.success) {
        return NextResponse.json(
          {
            message: "Booth owner berhasil dibuat.",
          },
          {
            status: 200,
          }
        );
      } else {
        return NextResponse.json(
          {
            message: addOwner.error,
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
