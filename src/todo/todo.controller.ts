/* eslint-disable @typescript-eslint/require-await */
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  CreateTodoRequest,
  TodoResponse,
  UpdateTodoRequest,
} from 'src/model/todo.model';
import { WebResponse } from 'src/model/web.model';
import { TodoService } from './todo.service';
import { CreateTodoSchema, UpdateTodoSchema } from './todo.validation';
import { ZodError } from 'zod';

@Controller('/api/todos')
export class TodoController {
  constructor(private todoService: TodoService) {}

  @Get()
  @HttpCode(200)
  async welcomeToGetTodos(): Promise<WebResponse<string>> {
    return {
      data: 'Welcome to the Get Todos endpoint!',
    };
  }

  @Get('get/:account_id')
  @HttpCode(200)
  async getTodos(
    @Param('account_id', ParseUUIDPipe) account_id: string,
  ): Promise<WebResponse<TodoResponse[]>> {
    try {
      console.log('account_id', account_id);
      const todos = await this.todoService.GetTodo(account_id);

      return {
        data: todos,
      };
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));

        throw new BadRequestException({
          message: 'Invalid account_id parameter',
          errors: validationErrors,
        });
      }

      if (error instanceof HttpException) {
        throw error;
      }

      throw new BadRequestException('Failed to retrieve todos');
    }
  }

  @Post('create')
  @HttpCode(200)
  async createAccount(
    @Body() request: CreateTodoRequest,
  ): Promise<WebResponse<TodoResponse>> {
    try {
      const result = await this.todoService.CreateTodo(
        CreateTodoSchema.parse(request),
      );
      return {
        data: result,
      };
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));

        throw new BadRequestException({
          message: 'All fields are required',
          errors: validationErrors,
        });
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException('validation is not successful');
    }
  }

  @Patch('update/:account_id')
  @HttpCode(200)
  async update(
    @Param('todo_id', ParseUUIDPipe) todo_id: string,
    @Body() request: UpdateTodoRequest,
  ): Promise<WebResponse<TodoResponse>> {
    try {
      const result = await this.todoService.UpdateTodo(
        todo_id,
        UpdateTodoSchema.parse(request),
      );
      return {
        data: result,
      };
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));

        throw new BadRequestException({
          message: 'All fields are required',
          errors: validationErrors,
        });
      }

      if (error instanceof HttpException) {
        throw error;
      }

      throw new BadRequestException('validation failed');
    }
  }

  @Delete('delete/:todo_id')
  @HttpCode(200)
  async delete(
    @Param('todo_id', ParseUUIDPipe) todo_id: string,
  ): Promise<WebResponse<TodoResponse>> {
    try {
      const result = await this.todoService.DeleteTodo(todo_id);
      return {
        data: result,
      };
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));

        throw new BadRequestException({
          message: 'All fields are required',
          errors: validationErrors,
        });
      }

      if (error instanceof HttpException) {
        throw error;
      }

      throw new BadRequestException('validation failed');
    }
  }
}
