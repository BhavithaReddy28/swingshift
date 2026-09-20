import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name is required"),
  charityId: z.string().uuid("Invalid charity selected"),
  charityPercentage: z
    .number()
    .min(10, "Minimum charity contribution is 10%")
    .max(100, "Maximum charity contribution is 100%"),
  plan: z.enum(["monthly", "yearly"]),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const scoreSchema = z.object({
  score: z
    .number()
    .int("Score must be a whole number")
    .min(1, "Score must be between 1 and 45")
    .max(45, "Score must be between 1 and 45"),
  playedOn: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
});

export const luckyNumbersSchema = z.object({
  numbers: z
    .array(
      z
        .number()
        .int("Numbers must be integers")
        .min(1, "Numbers must be between 1 and 45")
        .max(45, "Numbers must be between 1 and 45")
    )
    .length(5, "You must select exactly 5 numbers")
    .refine(
      (nums) => new Set(nums).size === 5,
      "All 5 lucky numbers must be unique"
    ),
});

export const updateCharityPreferenceSchema = z.object({
  charityId: z.string().uuid("Invalid charity ID").optional(),
  charityPercentage: z
    .number()
    .min(10, "Minimum contribution is 10%")
    .max(100, "Maximum contribution is 100%")
    .optional(),
});

export const directDonationSchema = z.object({
  charityId: z.string().uuid("Invalid charity ID"),
  amountPence: z.number().min(100, "Minimum donation amount is £1 (100p)"),
  donorEmail: z.string().email("Invalid donor email address"),
});

export const createDrawSchema = z.object({
  periodMonth: z
    .string()
    .regex(/^\d{4}-\d{2}-01$/, "Period month must be first of month YYYY-MM-01"),
  mode: z.enum(["random", "algorithmic"]),
});

export const verifyWinnerSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  rejectionReason: z.string().optional(),
});

export const charityCrudSchema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z.string().min(2, "Slug is required"),
  shortDescription: z.string().min(10, "Short description required"),
  longDescription: z.string().min(20, "Long description required"),
  logoUrl: z.string().url("Valid logo URL required"),
  heroImageUrl: z.string().url("Valid hero image URL required"),
  category: z.string().min(2, "Category is required"),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const charityEventSchema = z.object({
  charityId: z.string().uuid("Invalid charity ID"),
  title: z.string().min(2, "Title required"),
  description: z.string().min(5, "Description required"),
  eventDate: z.string(),
  location: z.string().min(2, "Location required"),
  imageUrl: z.string().url("Valid image URL required"),
});
