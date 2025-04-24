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
  getTodos() {}

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
