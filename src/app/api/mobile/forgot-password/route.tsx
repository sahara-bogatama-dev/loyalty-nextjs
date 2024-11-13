import { forgotUser } from "@/controller/register/action";
import { createUser } from "../../../../controller/register/register.db";
import { forgotInSchema, signUpSchema } from "../../../../lib/zod";
import { type NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();

    const { email } = await forgotInSchema.parseAsync(json);

    const create = await forgotUser({
      email,
    });

    if (create.success) {
      return NextResponse.json(
        {
          message: "Password berhasil di kirim melalui email.",
        },
        {
          status: 200,
        }
      );
    } else {
      return NextResponse.json(
        { message: create.error },
        {
          status: 403,
        }
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
}
