import { userRoles } from "@/controller/listUser/action";
import { userDetail } from "@/controller/userDetail/userDetail.db";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export const GET = auth(async function GET(req, ctx) {
  try {
    if (req.auth) {
      const userRole = await userRoles({ id: req.auth.user?.id as string });
      const getDetail = await userDetail({ id: req.auth.user?.id as string });

      return NextResponse.json(
        {
          users: getDetail,
          role: userRole.success ? userRole.value : [],
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
