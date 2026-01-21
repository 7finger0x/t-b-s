import { z } from 'zod';
import { isAddress } from 'viem';

export const addressSchema = z.string().refine((val) => isAddress(val), {
  message: "Invalid Ethereum address",
}).transform((val) => val.toLowerCase() as `0x${string}`);

export const signRequestSchema = z.object({
  address: addressSchema,
});

export const frameRequestSchema = z.object({
  untrustedData: z.object({
    fid: z.number().int().positive(),
    url: z.string().url(),
    messageHash: z.string(),
    timestamp: z.number(),
    network: z.number(),
    buttonIndex: z.number(),
    inputText: z.string().optional(),
    castId: z.object({
      fid: z.number(),
      hash: z.string(),
    }),
  }),
  trustedData: z.object({
    messageBytes: z.string(),
  }),
});