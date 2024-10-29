import { listMember, listUsersBooth } from "@/controller/booth/action";
import { auth } from "@/lib/auth";
import { listBoothMemberInSchema } from "@/lib/zod";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export const GET = auth(async function GET(req, ctx) {
  try {
    if (req.auth) {
      const json = await req.json();

      const { boothId } = await listBoothMemberInSchema.parseAsync(json);

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
