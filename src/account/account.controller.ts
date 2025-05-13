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
import { AccountService } from './account.service';
import {
  AccountResponse,
  LoginAccountRequest,
  RegisterAccountRequest,
  UpdateAccountRequest,
} from 'src/model/account.model';
import { WebResponse } from 'src/model/web.model';
import { CreateAccountSchema, UpdateAccountSchema } from './account.validation';
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

      if (error instanceof HttpException) {
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
    try {
      const result = await this.accountService.GetAccountByUsername(request);
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

      throw new BadRequestException('validation is not successful');
    }
  }

  @Patch('update/:account_id')
  @HttpCode(200)
  async update(
    @Param('account_id', ParseUUIDPipe) account_id: string,
    @Body() request: UpdateAccountRequest,
  ): Promise<WebResponse<AccountResponse>> {
    try {
      const result = await this.accountService.UpdateAccount(
        account_id,
        UpdateAccountSchema.parse(request),
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

  @Delete('delete/:username') //  Changed the route
  @HttpCode(200)
  async delete(
    @Param('username') username: string, // Get username from the body
  ): Promise<WebResponse<void>> {
    try {
      //  Call the account service's delete method
      const response = await this.accountService.deleteAccount(username);

      return {
        data: response,
      };
    } catch (error) {
      //  Handle errors
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete account');
    }
  }
}
