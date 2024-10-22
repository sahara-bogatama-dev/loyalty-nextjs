import { validateMobile } from "@/controller/userDetail/userDetail.db";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export const POST = auth(async function POST(req, ctx) {
  try {
    if (req.auth) {
      const users = await validateMobile({ id: req.auth.user?.id as string });
      return NextResponse.json(
        { data: users },
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
