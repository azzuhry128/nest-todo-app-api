import { z } from 'zod';

export const AccountSchema = z.object({
  account_id: z.string().min(1),
  username: z.string().min(1).max(32),
  email_address: z.string().min(1).max(64),
  phone_number: z.string().min(1).max(64),
  password: z.string().min(1).max(64),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const CreateAccountSchema = AccountSchema.omit({
  account_id: true,
  createdAt: true,
  updatedAt: true,
});

export const LoginAccountSchema = AccountSchema.pick({
  email_address: true,
  password: true,
});

export const UpdateAccountSchema = AccountSchema.partial();
export const DeleteAccountSchema = AccountSchema.pick({
  account_id: true,
});
