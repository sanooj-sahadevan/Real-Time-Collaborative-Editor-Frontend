import { z } from "zod";

const passwordSchema = z
  .string()
  .min(1, "Password is required.")
  .min(6, "Password must be at least 6 characters.")
  .refine((value) => value === value.trim(), {
    message: "Password cannot start or end with whitespace.",
  })
  .regex(/[a-z]/, "Password must contain a lowercase letter.")
  .regex(/[A-Z]/, "Password must contain an uppercase letter.")
  .regex(/\d/, "Password must contain a number.")
  .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain a special character.");

const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required.")
  .email("Enter a valid email address.");

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(1, "Username is required.")
      .min(3, "Username must be between 3 and 50 characters.")
      .max(50, "Username must be between 3 and 50 characters.")
      .regex(/^[a-zA-Z0-9]+$/, "Username can contain only letters and numbers."),
    email: emailSchema,
    phone: z
      .string()
      .trim()
      .min(1, "Phone number is required.")
      .regex(/^[+]?[\d\s().-]{7,20}$/, "Enter a valid phone number."),
    age: z
      .string()
      .trim()
      .min(1, "Age is required.")
      .regex(/^\d+$/, "Age must be a whole number.")
      .transform(Number)
      .refine((value) => value >= 1 && value <= 100, "Age must be between 1 and 100."),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export type LoginFormData = z.input<typeof loginSchema>;
export type RegisterFormData = z.input<typeof registerSchema>;