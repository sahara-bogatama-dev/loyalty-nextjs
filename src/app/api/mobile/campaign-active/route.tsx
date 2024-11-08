import { listCampaignActives } from "@/controller/campaign/action";
import { auth } from "@/lib/auth";
import _ from "lodash";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export const GET = auth(async function GET(req, ctx) {
  try {
    if (req.auth) {
      const activeCampaign = await listCampaignActives();

      return NextResponse.json(
        {
          activeCampaign: activeCampaign.success
            ? _.map(activeCampaign.value, (o) => ({
                ...o,
                photo: `${process.env.PHOTO_URL}/api/campaign/image/${o.campaignId}`,
              }))
            : [],
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
