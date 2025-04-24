import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { TestService } from './test.service';
import { TestModule } from './test.module';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

describe('TodoController (e2e)', () => {
  let app: INestApplication<App>;
  let logger: Logger;
  let testService: TestService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // prismaService = app.get(PrismaService);
    logger = app.get(WINSTON_MODULE_PROVIDER);
    testService = app.get(TestService);
  });

  describe('GET_TODO /api/todo/get/:account_id', () => {
    let account_id: string;

    beforeAll(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule, TestModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();

      // prismaService = app.get(PrismaService);
      logger = app.get(WINSTON_MODULE_PROVIDER);
      testService = app.get(TestService);

      await testService.purgeAccount();
      account_id = await testService.createAccount();
      await testService.createTodo(account_id);
    });
    it('should be rejected if account_id doesnt match', async () => {
      const response = await request(app.getHttpServer()).post(
        '/api/todo/get/11111111-1111-1111-1111-111111111111',
      );

      logger.info(response.body);
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to retrieve todos', async () => {
      const response = await request(app.getHttpServer()).post(
        `/api/todos/${account_id}`,
      );
      logger.info(response.body);
      expect(response.status).toBe(200);
    });
  });

  describe('POST_TODO /api/todo/create/:account_id', () => {
    let account_id: string;
    beforeAll(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule, TestModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();

      // prismaService = app.get(PrismaService);
      logger = app.get(WINSTON_MODULE_PROVIDER);
      testService = app.get(TestService);

      await testService.purgeAccount();
      account_id = await testService.createAccount();
    });
    it('should be rejected if request is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/todos/create/${account_id}')`)
        .send({
          title: '',
          description: '',
          status: '',
          due_date: '',
          priority: '',
          tags: [],
        });
      logger.info(response.body);
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to create todo', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/todos/create/${account_id}')`)
        .send({
          title: 'test todo',
          description: 'test todo description',
          status: false,
          due_date: Date.now(),
          priority: 'low',
          tags: ['test tag'],
        });
      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('PATCH_TODO /api/todo/update/:todo_id', () => {
    let account_id: string;
    beforeAll(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule, TestModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();

      // prismaService = app.get(PrismaService);
      logger = app.get(WINSTON_MODULE_PROVIDER);
      testService = app.get(TestService);

      await testService.purgeAccount();
      account_id = await testService.createAccount();
    });
    it('should be rejected if request is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/todos/update/${account_id}')`)
        .send({
          title: '',
          description: '',
          status: '',
          due_date: '',
          priority: '',
          tags: [],
        });
      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
    });
    it('should be able to update todo', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/todos/update/${account_id}')`)
        .send({
          title: 'test todo',
          description: 'test todo description',
          status: false,
          due_date: Date.now(),
          priority: 'low',
          tags: ['test tag'],
        });
      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('DELETE_TODO /api/accounts/:todo_id', () => {
    let createdAccountID: string;
    const nonExistentAccountID = '11111111-1111-1111-1111-111111111111';

    beforeAll(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule, TestModule],
      }).compile();
      app = moduleFixture.createNestApplication();
      await app.init();
      // prismaService = app.get(PrismaService);
      logger = app.get(WINSTON_MODULE_PROVIDER);
      testService = app.get(TestService);
      await testService.purgeAccount();
      createdAccountID = await testService.createAccount();
    });
    it('should be rejected if request is empty', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/accounts/update/${createdAccountID}`)
        .send({
          username: '',
          email_address: '',
          phone_number: '',
          password: '',
        });
      logger.info(response.body);
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should be rejected if account not found', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/accounts/update/${nonExistentAccountID}`)
        .send({
          username: 'updated',
          email_address: 'test@gmail.com',
          phone_number: 'updated_number_123',
          password: 'updated password',
        });
      logger.info(response.body);
      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to update username', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/accounts/update/${createdAccountID}`)
        .send({
          username: 'test updated',
        });

      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.username).toBe('test updated');
    });

    it('should be able to update email address', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/accounts/update/${createdAccountID}`)
        .send({
          email_address: 'updated@gmail.com',
        });

      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.email_address).toBe('updated@gmail.com');
    });

    it('should be able to update phone number', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/accounts/update/${createdAccountID}`)
        .send({
          email_address: 'test@gmail.com',
          phone_number: 'updated_number_123',
        });

      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.phone_number).toBe('updated_number_123');
    });

    it('should be able to update password', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/accounts/update/${createdAccountID}`)
        .send({
          password: 'updated password',
        });

      logger.info(response.body);
      expect(response.status).toBe(200);
    });
  });
});
