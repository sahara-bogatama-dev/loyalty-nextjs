import { campaignImage } from "@/controller/campaign/crudCampaign.db";
import { packageImage } from "@/controller/redeemPackage/crudPackage.db";
import { userDetail } from "@/controller/userDetail/userDetail.db";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export const GET = auth(async function GET(req, ctx) {
  try {
    if (req.auth) {
      const { params } = ctx;
      const packageId = Array.isArray(params?.id)
        ? params.id[0]
        : params?.id ?? "";

      const images = await packageImage({
        packageId: packageId,
      });

      if (images?.photo) {
        const bufferData = Buffer.from(images.photo);

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
