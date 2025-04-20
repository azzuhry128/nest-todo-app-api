import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Post,
} from '@nestjs/common';
import { AccountService } from './account.service';
import {
  AccountResponse,
  LoginAccountRequest,
  RegisterAccountRequest,
  UpdateAccountRequest,
} from 'src/model/account.model';
import { WebResponse } from 'src/model/web.model';
import { Account } from '@prisma/client';
import { CreateAccountSchema } from './account.validation';
import { ZodError } from 'zod';

@Controller('/api/accounts')
export class AccountController {
  constructor(private accountService: AccountService) {}

  @Get()
  getAccounts() {
    // Mock response for demonstration purposes
    return [
      { id: 1, username: 'user1', email: 'user1@example.com' },
      { id: 2, username: 'user2', email: 'user2@example.com' },
    ];
  }

  @Post('register')
  @HttpCode(200)
  async createAccount(
    @Body() request: RegisterAccountRequest,
  ): Promise<WebResponse<AccountResponse>> {
    try {
      const result = await this.accountService.CreateAccount(
        CreateAccountSchema.parse(request),
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

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() request: LoginAccountRequest,
  ): Promise<WebResponse<AccountResponse>> {
    const result = await this.accountService.GetAccountByUsername(request);
    return {
      data: result,
    };
  }

  @Patch('update')
  @HttpCode(200)
  async update(
    account: Account,
    @Body() request: UpdateAccountRequest,
  ): Promise<WebResponse<AccountResponse>> {
    const result = await this.accountService.UpdateAccount(account, request);
    return {
      data: result,
    };
  }
}
