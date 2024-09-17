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
  fullname: z
    .string({ required_error: "Full name is required" })
    .min(1, "Full name is required"),
  createdBy: z.string().optional(),
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
