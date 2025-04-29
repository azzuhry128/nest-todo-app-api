import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import {
  CreateTodoRequest,
  TodoResponse,
  UpdateTodoRequest,
} from 'src/model/todo.model';
import { CreateTodoSchema } from './todo.validation';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
@Injectable()
export class TodoService {
  constructor(
    private prisma: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}

  async GetTodo(account_id: string): Promise<TodoResponse[]> {
    const account = await this.prisma.account.findFirst({
      where: { account_id: account_id },
    });

    if (!account) {
      throw new HttpException(
        {
          message: `Account with id ${account_id} not found`,
          errors: {
            account_id: account_id,
            reason: 'No account associated with the provided id',
          },
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const todos = await this.prisma.todo.findMany({
      where: {
        account_id: account.account_id,
      },
    });

    const todoResponses: TodoResponse[] = todos.map((todo) => ({
      todo_id: todo.todo_id,
      title: todo.title,
      description: todo.description,
      status: todo.status,
      due_date: todo.due_date,
      priority: todo.priority,
      tags: todo.tags,
      account_id: todo.account_id,
    }));

    return todoResponses;
  }

  async CreateTodo(
    account_id: string,
    request: CreateTodoRequest,
  ): Promise<TodoResponse> {
    const { title, description } = CreateTodoSchema.parse(request);

    this.logger.info(`parameter account_id: ${account_id}`);

    const existingAccount = await this.prisma.account.findFirst({
      where: {
        account_id: account_id,
      },
    });

    if (!existingAccount) {
      this.logger.error(`Account with id ${account_id} does not found`);
      throw new HttpException(
        {
          message: `Account with id ${account_id} not found`,
          errors: {
            account_id: account_id,
            reason: 'No account associated with the provided id',
          },
        },
        HttpStatus.NOT_FOUND,
      );
    }

    this.logger.info(`creating todo for account_id: ${account_id}`);

    const todo = await this.prisma.todo.create({
      data: {
        account_id,
        title,
        description,
        status: false,
        due_date: new Date(Date.now()),
        priority: 'low',
        tags: ['test'],
      },
    });

    return todo;
  }

  async UpdateTodo(
    todo_id: string,
    request: UpdateTodoRequest,
  ): Promise<TodoResponse> {
    const existingTodo = await this.prisma.todo.findFirst({
      where: {
        todo_id: todo_id,
      },
    });

    if (!existingTodo) {
      this.logger.error(`Todo with id ${todo_id} does not exist`, existingTodo);
      throw new HttpException(
        {
          message: `Todo with id ${todo_id} not found`,
          errors: {
            todo_id: todo_id,
            reason: 'No todo associated with the provided id',
          },
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const updateData: Partial<UpdateTodoRequest> = {};
    for (const [key, value] of Object.entries(request)) {
      if (value !== undefined && value !== null && value !== '') {
        updateData[key as keyof UpdateTodoRequest] = value;
      }
    }

    const updatedTodo = await this.prisma.todo.update({
      where: {
        todo_id: todo_id,
      },
      data: updateData,
    });

    return {
      todo_id: updatedTodo.todo_id,
      title: updatedTodo.title,
      description: updatedTodo.description,
      status: updatedTodo.status,
      due_date: updatedTodo.due_date,
      priority: updatedTodo.priority,
      tags: updatedTodo.tags,
      account_id: updatedTodo.account_id,
    };
  }

  async DeleteTodo(todo_id: string): Promise<TodoResponse> {
    const existingTodo = await this.prisma.todo.findFirst({
      where: {
        todo_id: todo_id,
      },
    });

    if (!existingTodo) {
      this.logger.error(`Todo with id ${todo_id} does not exist`, existingTodo);
      throw new HttpException(
        {
          message: `Todo with id ${todo_id} not found`,
          errors: {
            todo_id: todo_id,
            reason: 'No todo associated with the provided id',
          },
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const deletedTodo = await this.prisma.todo.delete({
      where: {
        todo_id: todo_id,
      },
    });

    return deletedTodo;
  }
}
