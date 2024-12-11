import { addPoints } from "@/controller/point/action";
import { auth } from "@/lib/auth";
import { addPointInSchema } from "@/lib/zod";
import _ from "lodash";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export const POST = auth(async function POST(req, ctx) {
  try {
    if (req.auth) {
      const json = await req.json();

      const { labelingProduct, scanDate } = await addPointInSchema.parseAsync(
        json
      );

      const createdBy = req.auth?.user?.name ?? "";

      const addPoint = await addPoints({
        userId: req.auth.user?.id,
        createdBy,
        labelingProduct,
        scanDate,
      });

      if (addPoint.success) {
        return NextResponse.json(
          {
            message: `Point ${addPoint.value}, berhasil di peroleh`,
          },
          {
            status: 200,
          }
        );
      } else {
        return NextResponse.json(
          {
            message: addPoint.error,
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
