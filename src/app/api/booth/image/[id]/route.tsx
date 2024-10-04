import { boothMemberImage } from "@/controller/booth/crudBooth.db";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export const GET = auth(async function GET(req, ctx) {
  try {
    if (req.auth) {
      const { params } = ctx;
      const memberId = Array.isArray(params?.id)
        ? params.id[0]
        : params?.id ?? "";

      const images = await boothMemberImage({
        boothMemberId: memberId,
      });

      if (images?.photoBooth) {
        const bufferData = Buffer.from(images.photoBooth);

        return new Response(bufferData, {
          status: 200,
          headers: {
            "Content-Type": "image/jpg",
          },
        });
      } else {
        return NextResponse.json(
          { message: "Profile image not found" },
          { status: 404 }
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
