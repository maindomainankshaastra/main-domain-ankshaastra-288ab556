import { z } from "zod";

// Phone number validation for Indian numbers
const phoneRegex = /^(\+91)?[6-9]\d{9}$/;

export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name must be less than 100 characters" })
    .regex(/^[a-zA-Z\s]+$/, { message: "Name can only contain letters and spaces" }),
  email: z
    .string()
    .trim()
    .email({ message: "Please enter a valid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  phone: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => !val || phoneRegex.test(val.replace(/\s/g, "")),
      { message: "Please enter a valid Indian phone number" }
    ),
  subject: z
    .string()
    .min(1, { message: "Please select a subject" }),
  message: z
    .string()
    .trim()
    .min(10, { message: "Message must be at least 10 characters" })
    .max(1000, { message: "Message must be less than 1000 characters" }),
});

export const paymentFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name must be less than 100 characters" }),
  email: z
    .string()
    .trim()
    .email({ message: "Please enter a valid email address" }),
  phone: z
    .string()
    .trim()
    .refine(
      (val) => phoneRegex.test(val.replace(/\s/g, "")),
      { message: "Please enter a valid Indian phone number" }
    ),
  cardNumber: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d{16}$/.test(val.replace(/\s/g, "")),
      { message: "Card number must be 16 digits" }
    ),
  expiry: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^(0[1-9]|1[0-2])\/\d{2}$/.test(val),
      { message: "Expiry must be in MM/YY format" }
    ),
  cvv: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d{3,4}$/.test(val),
      { message: "CVV must be 3 or 4 digits" }
    ),
  upiId: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[\w.-]+@[\w]+$/.test(val),
      { message: "Please enter a valid UPI ID" }
    ),
});

export const calculatorSchema = z.object({
  name: z
    .string()
    .trim()
    .max(100, { message: "Name must be less than 100 characters" })
    .optional(),
  birthDate: z
    .string()
    .min(1, { message: "Please select a date of birth" }),
  partnerName: z
    .string()
    .trim()
    .max(100, { message: "Name must be less than 100 characters" })
    .optional(),
  partnerBirthDate: z
    .string()
    .optional(),
  zodiacSign: z
    .string()
    .optional(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
export type PaymentFormData = z.infer<typeof paymentFormSchema>;
export type CalculatorFormData = z.infer<typeof calculatorSchema>;
