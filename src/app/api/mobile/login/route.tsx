import { login } from "@/controller/action";
import { signInSchema } from "../../../../lib/zod";
import { type NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();

    const { email, password } = await signInSchema.parseAsync(json);

    const signIn = await login({ email, password });

    if (signIn.success) {
      return NextResponse.json(
        { message: "signIn Berhasil..." },
        {
          status: 200,
        }
      );
    } else {
      return NextResponse.json(
        { message: signIn.error.replace(/Error: /g, "") },
        {
          status: 401,
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
