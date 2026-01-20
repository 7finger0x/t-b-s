import { z } from 'zod';
import { getAddress } from 'viem';

/**
 * Custom Zod validator for Ethereum addresses.
 * Validates format and normalizes to lowercase.
 */
const ethereumAddressSchema = z
  .string()
  .refine((val) => {
    try {
      getAddress(val);
      return true;
    } catch {
      return false;
    }
  }, {
    message: 'Invalid Ethereum address format',
  })
  .transform((val) => {
    // Normalize using getAddress then convert to lowercase
    return getAddress(val).toLowerCase() as `0x${string}`;
  });

/**
 * Schema for /api/sign route request body.
 */
export const signRequestSchema = z.object({
  address: ethereumAddressSchema,
});

/**
 * Schema for /api/frame route request body (Farcaster Frame).
 * Based on Farcaster Frame v2 specification.
 */
export const frameRequestSchema = z.object({
  untrustedData: z.object({
    fid: z.number().int().positive().optional(),
    url: z.string().url().optional(),
    messageHash: z.string().optional(),
    timestamp: z.number().int().positive().optional(),
    network: z.number().int().optional(),
    buttonIndex: z.number().int().min(1).max(4).optional(),
    castId: z
      .object({
        fid: z.number().int().positive(),
        hash: z.string(),
      })
      .optional(),
  }).optional(),
  trustedData: z
    .object({
      messageBytes: z.string(),
    })
    .optional(),
});

/**
 * Type inference for sign request.
 */
export type SignRequest = z.infer<typeof signRequestSchema>;

/**
 * Type inference for frame request.
 */
export type FrameRequest = z.infer<typeof frameRequestSchema>;
