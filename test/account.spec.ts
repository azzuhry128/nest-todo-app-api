import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { TestService } from './test.service';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let testService: TestService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    testService = app.get(TestService);
  });

  describe('POST /api/accounts/registration', () => {
    beforeEach(async () => {
      await testService.deleteAll();
    });

    it('should be rejected if request is invalid', async () => {
      const testResponse = await request(app.getHttpServer())
        .post('/api/accounts')
        .send({
          username: '',
          email_address: '',
          phone_number: '',
          password: '',
        });
      expect(testResponse.status).toBe(400);
      expect(testResponse.body.errors).toBeDefined();
    });

    it('should be rejected if account already exist', async () => {
      await testService.createAccount();
      const testResponse = await request(app.getHttpServer())
        .post('/api/accounts')
        .send({
          username: 'test',
          email_address: 'test',
          phone_number: 'test',
          password: 'test',
        });

      expect(testResponse.status).toBe(400);
      expect(testResponse.body.errors).toBeDefined();
    });
  });

  describe('POST /api/accounts/login', () => {
    beforeEach(async () => {
      await testService.deleteAccount();
      await testService.createAccount();
    });
    it('should be rejected if request is invalid', async () => {
      const testResponse = await request(app.getHttpServer())
        .post('/api/accounts/login')
        .send({
          email_address: '',
          password: '',
        });
      expect(testResponse.status).toBe(400);
      expect(testResponse.body.errors).toBeDefined();
    });
    it('should be able to login', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/accounts/login')
        .send({ email_address: 'test', password: 'test' });

      expect(response.status).toBe(200);
      expect(response.body.data.username).toBe('test');
      expect(response.body.data.email_address).toBe('test@gmail.com');
    });
  });

  describe('PATCH /api/accounts/update', () => {
    beforeEach(async () => {
      await testService.deleteAccount();
      await testService.createAccount();
    });

    it('PATCH should be rejected if request is invalid', async () => {
      const testResponse = await request(app.getHttpServer())
        .post('/api/accounts/update')
        .send({
          username: '',
          email_address: '',
          phone_number: '',
          password: '',
        });

      expect(testResponse.status).toBe(400);
      expect(testResponse.body.errors).toBeDefined();
    });

    it('PATCH should be able to update USERNAME', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/accounts/update')
        .send({ username: 'test updated' });

      expect(response.status).toBe(200);
      expect(response.body.data.username).toBe('test updated');
    });

    it('PATCH should be able to update EMAIL', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/accounts/update')
        .send({ email_address: 'updated@gmail.com' });

      expect(response.status).toBe(200);
      expect(response.body.data.username).toBe('test');
      expect(response.body.data.email_address).toBe('test@gmail.com');
    });

    it('PATCH should be able to update PHONE', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/accounts/update')
        .send({ phone_number: 'updated number' });

      expect(response.status).toBe(200);
      expect(response.body.data.username).toBe('test');
      expect(response.body.data.email_address).toBe('test@gmail.com');
    });

    it('PATCH should be able to update PASSWORD', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/accounts/update')
        .send({ password: 'updated password' });

      expect(response.status).toBe(200);
      expect(response.body.data.username).toBe('test');
      expect(response.body.data.email_address).toBe('test@gmail.com');
    });
  });
});
