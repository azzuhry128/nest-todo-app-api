// import { z } from 'zod';

// export const TodoSchema = z.object({
//   todo_id: z.number().min(1).max(64),
//   account_id: z.string().min(1).max(64),
//   title: z.string().min(1).max(32),
//   description: z.string().min(1).max(64),
//   status: z.boolean().default(false),
//   due_date: z.string().optional(),
//   priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
//   tags: z.array(z.string()).optional(),
//   createdAt: z.date().optional(),
//   updatedAt: z.date().optional(),
// });

// export const CreateTodoSchema = TodoSchema.omit({
//   todo_id: true,
//   account_id: true,
//   createdAt: true,
//   updatedAt: true,
// }).extend({
//   title: z.string().min(1, { message: 'Title is required' }),
// });

// export const GetAllTodoTasksSchema = z.object({
//   account_id: z.string().min(1).max(64),
// });

// export const UpdateTodoSchema = TodoSchema.pick({ todo_id: true }).extend({
//   title: z.string().min(1).optional(),
//   description: z.string().optional(),
//   status: z.boolean().optional(),
// });

// export const DeleteTodoTaskSchema = z.object({
//   todo_id: z.number().min(1).positive(),
// });
