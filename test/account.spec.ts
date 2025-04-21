import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { TestService } from './test.service';
import { TestModule } from './test.module';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let logger: Logger;
  let testService: TestService;
  // let prismaService: PrismaService;

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

  describe('POST /api/accounts/register', () => {
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
    });
    it('should be rejected if request is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/accounts/register')
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

    it('should be able to register', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/accounts/register')
        .send({
          username: 'test',
          email_address: 'test@gmail.com',
          phone_number: 'test123',
          password: 'test',
        });
      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.username).toBe('test');
    });

    it('should be rejected if username already exist', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/accounts/register')
        .send({
          username: 'test',
          email_address: 'test@gmail.com',
          phone_number: 'test123',
          password: 'test',
        });
      logger.info(response.body);
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('POST /api/accounts/login', () => {
    it('should be rejected if request is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/accounts/login')
        .send({
          email_address: '',
          password: '',
        });
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
    it('should be able to login', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/accounts/login')
        .send({
          email_address: 'test@gmail.com',
          password: 'test',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.username).toBe('test');
      expect(response.body.data.email_address).toBe('test@gmail.com');
    });

    it('should be rejected if password is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/accounts/login')
        .send({
          email_address: 'test@gmail.com',
          password: 'false',
        });
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should be rejected if email is not exist', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/accounts/login')
        .send({
          email_address: 'false',
          password: 'test',
        });
      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe(' /api/accounts/update', () => {
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
