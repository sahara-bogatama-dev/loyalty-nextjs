import { listMember, listUsersBooth } from "@/controller/booth/action";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export const GET = auth(async function GET(req, ctx) {
  try {
    if (req.auth) {
      const { params } = ctx;
      const boothId = Array.isArray(params?.id)
        ? params.id[0]
        : params?.id ?? "";

      const listUser = await listMember({ boothId });

      return NextResponse.json(
        {
          listBooth: listUser.success ? listUser.value : [],
        },
        {
          status: 200,
        }
      );
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
