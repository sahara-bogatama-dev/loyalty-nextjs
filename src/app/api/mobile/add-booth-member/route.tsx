import { addBoothMembers } from "@/controller/booth/action";
import { auth } from "@/lib/auth";
import { boothMemberInSchema } from "@/lib/zod";
import _ from "lodash";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export const POST = auth(async function POST(req, ctx) {
  try {
    if (req.auth) {
      const json = await req.json();

      const { boothId, userId, address, photo, geolocation } =
        await boothMemberInSchema.parseAsync(json);

      const createdBy = req.auth?.user?.name ?? "";

      const addMember = await addBoothMembers({
        boothId,
        userId,
        address,
        photo,
        geolocation,
        createdBy,
      });

      if (addMember.success) {
        return NextResponse.json(
          {
            message: "Member booth berhasil dibuat.",
          },
          {
            status: 200,
          }
        );
      } else {
        return NextResponse.json(
          {
            message: addMember.error,
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
