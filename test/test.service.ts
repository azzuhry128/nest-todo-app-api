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

  async purgeAccount() {
    this.logger.warn('Purging previous account data');
    await this.deleteAccount();
    await this.deleteUpdatedAccount();
  }

  async purgeTodo() {
    this.logger.warn('Purging previous todo data');
    await this.deleteAllTodo();
  }

  async createAccount() {
    this.logger.info('Creating test account');
    const account = await this.prismaService.account.create({
      data: {
        username: 'test',
        email_address: 'test@gmail.com',
        phone_number: 'test123',
        password: await bcrypt.hash('test', 10),
      },
    });
    return account.account_id;
  }

  async createTodo(account_id: string) {
    this.logger.info('Creating test todo');
    const todo = await this.prismaService.todo.create({
      data: {
        title: 'test todo',
        description: 'test todo description',
        status: false,
        due_date: new Date(),
        priority: 'low',
        tags: ['test'],
        account_id: account_id,
      },
    });
    return todo.todo_id;
  }

  async deleteAllTodo() {
    this.logger.info('Deleting test todo');
    await this.prismaService.todo.deleteMany();

    this.logger.info('Test todo deleted successfully');
  }

  async deleteAccount() {
    this.logger.info('Deleting test account');
    const targetAccount = await this.prismaService.account.findFirst({
      where: {
        username: 'test',
      },
    });

    if (!targetAccount) {
      this.logger.info('No test account found to delete');
      return;
    }

    await this.prismaService.account.delete({
      where: {
        account_id: targetAccount.account_id,
      },
    });
    this.logger.info('Test account deleted successfully');
  }

  async deleteUpdatedAccount() {
    this.logger.info('Deleting test account');
    const targetAccount = await this.prismaService.account.findFirst({
      where: {
        username: 'test updated',
      },
    });

    if (!targetAccount) {
      this.logger.info('No test account found to delete');
      return;
    }

    await this.prismaService.account.delete({
      where: {
        account_id: targetAccount.account_id,
      },
    });
    this.logger.info('Test account deleted successfully');
  }
}
