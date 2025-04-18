import { Body, Controller, HttpCode, Patch, Post } from '@nestjs/common';
import { AccountService } from './account.service';
import {
  AccountResponse,
  LoginAccountRequest,
  RegisterAccountRequest,
  UpdateAccountRequest,
} from 'src/model/account.model';
import { WebResponse } from 'src/model/web.model';
import { Account } from '@prisma/client';

@Controller('/api/accounts')
export class AccountController {
  constructor(private accountService: AccountService) {}

  @Post('register')
  @HttpCode(200)
  async createAccount(
    @Body() request: RegisterAccountRequest,
  ): Promise<WebResponse<AccountResponse>> {
    const result = await this.accountService.CreateAccount(request);
    return {
      data: result,
    };
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
