import { changePasswords, forgotUser } from "@/controller/register/action";
import {
  changePassInSchema,
  forgotInSchema,
  signUpSchema,
} from "../../../../lib/zod";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/lib/auth";

export const POST = auth(async function POST(req, ctx) {
  try {
    if (req.auth) {
      const json = await req.json();

      const { password } = await changePassInSchema.parseAsync(json);

      const updates = await changePasswords({
        password,
        userId: req.auth.user?.id as string,
        updatedBy: req.auth.user?.name as string,
      });

      if (updates.success) {
        return NextResponse.json(
          {
            message: "Password berhasil di ubah.",
          },
          {
            status: 200,
          }
        );
      } else {
        return NextResponse.json(
          { message: updates.error },
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
      // Return `null` to indicate that the credentials are invalid
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
