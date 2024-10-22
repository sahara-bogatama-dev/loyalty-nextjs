import { addDRS } from "@/controller/deliveryOrder/action";
import { auth } from "@/lib/auth";
import { createDRInSchema } from "@/lib/zod";
import _ from "lodash";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export const POST = auth(async function POST(req, ctx) {
  try {
    if (req.auth) {
      const json = await req.json();

      const {
        shippingDate,
        agentId,
        customerName,
        deliveryAddress,
        totalWeight,
        deliveryNote,
        product,
      } = await createDRInSchema.parseAsync(json);

      const createdBy = req.auth?.user?.name ?? "";

      const addDR = await addDRS({
        shippingDate,
        agentId,
        customerName,
        deliveryAddress,
        totalWeight,
        deliveryNote,
        createdBy,
        product: _.map(product, (o) => ({
          ...o,
          statusProduct: 7,
          createdBy,
        })),
      });

      if (addDR.success) {
        return NextResponse.json(
          {
            message: "Delivery Request berhasil dibuat.",
          },
          {
            status: 200,
          }
        );
      } else {
        return NextResponse.json(
          {
            message: addDR.error,
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
