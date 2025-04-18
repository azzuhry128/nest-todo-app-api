import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcrypt';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class TestService {
  constructor(
    private prismaService: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async deleteAll() {
    await this.deleteTodo();
    await this.deleteAccount();
    this.logger.info('Purging previous data');
  }

  async createAccount() {
    this.logger.info('Creating test account');
    await this.prismaService.account.create({
      data: {
        username: 'test',
        email_address: 'test@gmail.com',
        phone_number: 'test',
        password: await bcrypt.hash('test', 10),
      },
    });
  }

  async deleteAccount() {
    this.logger.info('Deleting test account');
    await this.prismaService.account.delete({
      where: {
        username: 'test username',
      },
    });
  }

  async createTodo() {
    this.logger.info('Creating test todo');
    await this.prismaService.todo.create({
      data: {
        title: 'test todo',
        description: 'test todo description',
      },
    });
  }

  async deleteTodo() {
    this.logger.info('Deleting test todo');
    await this.prismaService.todo.delete({
      where: {
        todo_owner: 'test username',
      },
    });
  }
}
