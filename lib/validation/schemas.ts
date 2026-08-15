import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email(),
  password: z.string().min(8)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const createOrderSchema = z.object({
  gameId: z.string().cuid(),
  productId: z.string().cuid(),
  playerDetails: z.record(z.string(), z.any())
});
