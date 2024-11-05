import { getRunningNumber } from "@/controller/running-number/action";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export const GET = auth(async function GET(req, ctx) {
  try {
    const running = await getRunningNumber();

    return NextResponse.json(
      {
        running: `FG/OUT/${running.success ? running.value.value : 0}`,
      },
      {
        status: 200,
      }
    );
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
