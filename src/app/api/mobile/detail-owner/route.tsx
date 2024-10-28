import { detailOwners } from "@/controller/booth/action";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export const GET = auth(async function GET(req, ctx) {
  try {
    if (req.auth) {
      const data = await detailOwners({ userId: req.auth.user?.id as string });

      if (data.success) {
        return NextResponse.json(
          {
            detailOwner: data.value,
          },
          {
            status: 200,
          }
        );
      } else {
        return NextResponse.json(
          {
            message: data.error,
          },
          {
            status: 403,
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
