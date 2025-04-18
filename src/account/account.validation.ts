import { z } from 'zod';

export const AccountSchema = z.object({
  account_id: z.number().min(1).positive(),
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
}).extend({
  title: z.string().min(1, { message: 'Title is required' }),
});

export const LoginAccountSchema = z.object({
  email_address: z.string().min(1).max(64),
  password: z.string().min(1).max(64),
});

export const UpdateAccountSchema = AccountSchema.pick({
  account_id: true,
}).extend({
  username: z.string().min(1).optional(),
  email_address: z.string().optional(),
  phone_number: z.string().optional(),
});

export const DeleteAccountSchema = z.object({
  account_id: z.number().min(1).positive(),
});
