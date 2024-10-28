import { z } from "zod";

export const signUpSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email"),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be more than 8 characters")
    .max(32, "Password must be less than 32 characters"),
  phone: z
    .string({ required_error: "Phone number is required" })
    .min(1, "Phone number is required")
    .max(15, "Phone number must be less than 15 characters"),
  dateofbirth: z
    .string({ required_error: "Date of birth is required" })
    .min(1, "Date of birth is required"),
  leader: z.string().optional(),
  roles: z
    .string({ required_error: "Roles is required" })
    .min(1, "Roles is required"),
  fullname: z
    .string({ required_error: "Full name is required" })
    .min(1, "Full name is required"),
  createdBy: z.string().optional(),
});

export const forgotInSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email"),
});

export const signInSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email"),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required")
    .min(8, "Password must be more than 8 characters")
    .max(32, "Password must be less than 32 characters"),
});

export const createDRInSchema = z.object({
  shippingDate: z.string({ required_error: "Shipping Date is required" }),
  agentId: z
    .string({ required_error: "Agent ID is required" })
    .min(1, "Agent ID cannot be empty"),
  customerName: z
    .string({ required_error: "Customer Name is required" })
    .min(1, "Customer Name cannot be empty"),
  deliveryAddress: z
    .string({ required_error: "Delivery Address is required" })
    .min(1, "Delivery Address cannot be empty"),
  deliveryNote: z
    .string({ required_error: "Delivery Note is required" })
    .min(1, "Delivery Note cannot be empty"),
  totalWeight: z
    .number({ required_error: "Total Weight is required" })
    .min(1, "Total Weight cannot be empty"),
  product: z
    .array(
      z.object({
        shipQty: z.number().min(1, "Ship Quantity must be at least 1"),
        labelingBox: z.string().min(1, "Label Box is required"),
        labelingBoxId: z.string().min(1, "Label Box ID is required"),
        productName: z.string().min(1, "Product Name is required"),
        unit: z.string().min(1, "Unit is required"),
      })
    )
    .min(1, "At least one product is required"),
});

export const boothMemberInSchema = z.object({
  boothId: z.string({ required_error: "Booth ID is required." }),
  userId: z.string({ required_error: "User ID is required." }),
  address: z.string({ required_error: "Address is required." }),
  photo: z.string({ required_error: "Photo is required." }),
  geolocation: z.string({ required_error: "Geolocation is required." }),
});

export const boothOwnerInSchema = z.object({
  address: z.string({ required_error: "Address is required." }),
  dateEstablishment: z.string({
    required_error: "Date of Establishment is required.",
  }),
  ig: z.string({ required_error: "Instagram handle is required." }),
  fb: z.string({ required_error: "Facebook handle is required." }),
  ecm: z.string({ required_error: "ECM is required." }),
  geolocation: z.string({ required_error: "Geolocation is required." }),
});

export const addPointInSchema = z.object({
  labelingProduct: z.string({
    required_error: "Labeling Product is required.",
  }),
  scanDate: z.string({
    required_error: "Scan Date is required.",
  }),
});

export const exchangePointInSchema = z.object({
  packageId: z.string({
    required_error: "Package Id is required.",
  }),
  agentId: z.string({
    required_error: "Agent Id is required.",
  }),
});
