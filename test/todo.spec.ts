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
    const fake_id = '11111111-1111-1111-1111-111111111111';

    beforeAll(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule, TestModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();

      // prismaService = app.get(PrismaService);
      logger = app.get(WINSTON_MODULE_PROVIDER);
      testService = app.get(TestService);

      await testService.purgeTodo();
      await testService.purgeAccount();
      account_id = await testService.createAccount();
      await testService.createTodo(account_id);
    });

    it('should be able to GET', async () => {
      const response = await request(app.getHttpServer()).get(`/api/todos`);

      logger.info(response.body);
      expect(response.status).toBe(200);
    });
    it('should be rejected if account_id doesnt match', async () => {
      const response = await request(app.getHttpServer()).get(
        `/api/todos/get/${fake_id}`,
      );

      console.log(response.body);
      logger.info(response.body);
      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to retrieve todos', async () => {
      const response = await request(app.getHttpServer()).get(
        `/api/todos/get/${account_id}`,
      );
      logger.info(response.body);
      expect(response.status).toBe(200);
    });
  });

  describe('POST_TODO /api/todo/create/:account_id', () => {
    let account_id: string;
    const fake_id = '11111111-1111-1111-1111-111111111111';

    beforeAll(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule, TestModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();

      // prismaService = app.get(PrismaService);
      logger = app.get(WINSTON_MODULE_PROVIDER);
      testService = app.get(TestService);

      await testService.purgeTodo();
      await testService.purgeAccount();
      account_id = await testService.createAccount();
    });
    it('should be rejected if request is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/todos/create/${account_id}`)
        .send({
          title: '',
          description: '',
        });
      logger.info(response.body);
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should be rejected if id doesnt exist', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/todos/create/${fake_id}`)
        .send({
          title: 'test',
          description: 'test',
        });
      logger.info(response.body);
      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    });
    it('should be able to create todo', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/todos/create/${account_id}`)
        .send({
          title: 'test',
          description: 'test',
        });
      logger.info(response.body);
      expect(response.status).toBe(200);
    });
  });

  describe('PATCH_TODO /api/todo/update/:todo_id', () => {
    let account_id: string;
    let todo_id: string;
    const fake_todo_id = '11111111-1111-1111-1111-111111111111';
    let new_due_date: string;

    beforeAll(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule, TestModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();

      // prismaService = app.get(PrismaService);
      logger = app.get(WINSTON_MODULE_PROVIDER);
      testService = app.get(TestService);

      await testService.purgeTodo();
      await testService.purgeAccount();
      account_id = await testService.createAccount();
      todo_id = await testService.createTodo(account_id);
      new_due_date = new Date().toISOString();
    });
    it('should be rejected if request is invalid', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/todos/update/${todo_id}`)
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

    it('should be rejected if todo id doesnt exist', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/todos/update/${fake_todo_id}`)
        .send({
          title: 'test update',
          description: 'test update',
          status: true,
          due_date: new Date().toISOString(),
          priority: 'test update',
          tags: ['test update'],
        });
      logger.info(response.body);
      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    });
    it('should be able to update todo', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/todos/update/${todo_id}`)
        .send({
          title: 'test update',
          description: 'test update',
          status: true,
          due_date: new Date(),
          priority: 'test update',
          tags: ['test update'],
        });
      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.title).toBe('test update');
      expect(response.body.data.description).toBe('test update');
      expect(response.body.data.status).toBe(true);
      expect(response.body.data.priority).toBe('test update');
      expect(response.body.data.tags).toEqual(['test update']);
    });

    it('should be able to update title', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/todos/update/${todo_id}`)
        .send({
          title: 'test update',
        });
      logger.info(response.body.object);
      expect(response.status).toBe(200);
      expect(response.body.data.title).toBe('test update');
    });

    it('should be able to update description', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/todos/update/${todo_id}`)
        .send({
          description: 'test update',
        });
      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.description).toBe('test update');
    });

    it('should be able to update status', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/todos/update/${todo_id}`)
        .send({
          status: true,
        });
      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe(true);
    });

    it('should be able to update due_date', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/todos/update/${todo_id}`)
        .send({
          due_date: new_due_date,
        });
      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.due_date).toBe(new_due_date);
    });

    it('should be able to update priority', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/todos/update/${todo_id}`)
        .send({
          priority: 'test update',
        });
      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.priority).toBe('test update');
    });

    it('should be able to update tags', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/todos/update/${todo_id}`)
        .send({
          tags: ['test updated'],
        });
      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.tags).toEqual(['test updated']);
    });
  });

  describe('DELETE_TODO /api/accounts/:todo_id', () => {
    let account_id: string;
    let todo_id: string;
    const fake_todo_id = '11111111-1111-1111-1111-111111111111';

    beforeAll(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule, TestModule],
      }).compile();
      app = moduleFixture.createNestApplication();
      await app.init();
      // prismaService = app.get(PrismaService);
      logger = app.get(WINSTON_MODULE_PROVIDER);
      testService = app.get(TestService);

      await testService.purgeTodo();
      await testService.purgeAccount();
      account_id = await testService.createAccount();
      todo_id = await testService.createTodo(account_id);
    });

    it('should be rejected if todo id doesnt exist', async () => {
      const response = await request(app.getHttpServer()).delete(
        `/api/todos/delete/${fake_todo_id}`,
      );
      logger.info(response.body);
      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to delete todo', async () => {
      const response = await request(app.getHttpServer()).delete(
        `/api/todos/delete/${todo_id}`,
      );

      logger.info(response.body);
      expect(response.status).toBe(200);
    });
  });
});
