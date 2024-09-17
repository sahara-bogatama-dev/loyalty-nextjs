import { createUser } from "../../../controller/register/register.db";
import { signUpSchema } from "../../../lib/zod";
import { type NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();

    const { email, password, phone, dateofbirth, leader, fullname, createdBy } =
      await signUpSchema.parseAsync(json);

    await createUser({
      email,
      password,
      phone,
      dateofbirth,
      leader,
      fullname,
      createdBy,
    });

    return NextResponse.json(
      { message: "" },
      {
        status: 200,
      }
    );
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
