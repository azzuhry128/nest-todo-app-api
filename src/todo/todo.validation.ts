import { z } from 'zod';

export const TodoSchema = z.object({
  todo_id: z.string().min(1).max(64),
  account_id: z.string().min(1).max(64),
  title: z.string().min(1).max(32),
  description: z.string().min(1).max(64),
  status: z.boolean().default(false),
  due_date: z.string(),
  priority: z.string(),
  tags: z.array(z.string()),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const CreateTodoSchema = TodoSchema.pick({
  title: true,
  description: true,
});

export const GetAllTodoSchema = TodoSchema.pick({
  account_id: true,
});

export const UpdateTodoSchema = TodoSchema.partial();

export const DeleteTodoSchema = TodoSchema.pick({
  todo_id: true,
});
