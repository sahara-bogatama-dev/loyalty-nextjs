import { listDataDeliveryMobile } from "@/controller/deliveryOrder/action";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export const GET = auth(async function GET(req, ctx) {
  try {
    if (req.auth) {
      const { params } = ctx;
      const days = Array.isArray(params?.id)
        ? params.days[0]
        : params?.days ?? 30;

      const listDR = await listDataDeliveryMobile({ days: days as number });

      return NextResponse.json(
        {
          listDR: listDR.success ? listDR.value : [],
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
