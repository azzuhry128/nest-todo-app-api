import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import {
  AccountResponse,
  LoginAccountRequest,
  RegisterAccountRequest,
  UpdateAccountRequest,
} from 'src/model/account.model';
import { PrismaService } from 'src/prisma.service';
import { LoginAccountSchema } from './account.validation';
import * as bcrypt from 'bcrypt';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
@Injectable()
export class AccountService {
  constructor(
    private prisma: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}

  async GetAccountByUsername(
    request: LoginAccountRequest,
  ): Promise<AccountResponse> {
    const { email_address, password } = LoginAccountSchema.parse(request);
    const account = await this.prisma.account.findUnique({
      where: { email_address },
    });

    if (!account) {
      this.logger.error(`Account with email ${email_address} does not found`);
      throw new HttpException(
        {
          message: `Account with email address ${email_address} not found`,
          errors: {
            email_address: email_address,
            reason: 'No account associated with the provided email',
          },
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const isPasswordValid = await bcrypt.compare(password, account.password);

    if (!isPasswordValid) {
      this.logger.error(
        `Password ${password} invalid for account ${email_address}`,
      );
      throw new HttpException(
        {
          message: 'Invalid password',
          errors: {
            field: 'password',
            reason: 'The provided password does not match our records',
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const accountResponse: AccountResponse = {
      account_id: account.account_id,
      username: account.username,
      email_address: account.email_address,
      phone_number: account.phone_number,
    };

    return accountResponse;
  }

  async CreateAccount(
    request: RegisterAccountRequest,
  ): Promise<AccountResponse> {
    const { username } = request;

    const duplicateUsername = await this.prisma.account.findUnique({
      where: {
        username,
      },
    });

    if (duplicateUsername) {
      this.logger.error(
        `Account with username ${username} already exists`,
        duplicateUsername,
      );

      throw new HttpException(
        {
          message: `Account with username ${username} already exists`,
          errors: [
            {
              field: 'username',
              reason: 'This username is already in use',
            },
          ],
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashedPassword = await bcrypt.hash(request.password, 10);

    const account = await this.prisma.account.create({
      data: {
        username,
        email_address: request.email_address,
        password: hashedPassword,
        phone_number: request.phone_number,
      },
    });

    return account;
  }

  async UpdateAccount(
    account_id: string,
    request: UpdateAccountRequest,
  ): Promise<AccountResponse> {
    const { username, email_address, phone_number, password } = request;

    this.logger.info(
      `Data input for update: { 
          username: ${username || 'N/A'}, 
          email_address: ${email_address || 'N/A'}, 
          phone_number: ${phone_number || 'N/A'}, 
          password: ${password || 'N/A'} 
        }`,
    );

    const accountExists = await this.prisma.account.findFirst({
      where: {
        account_id: account_id,
      },
    });

    if (!accountExists) {
      this.logger.error(
        `Account with email ${email_address} does not exist`,
        accountExists,
      );
      throw new HttpException(
        {
          message: `Account with email address ${email_address} not found`,
          errors: {
            email_address: email_address,
            reason: 'No account associated with the provided email',
          },
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const updateData: Partial<UpdateAccountRequest> = {};
    for (const [key, value] of Object.entries(request)) {
      if (typeof value === 'string') {
        if (value.trim() !== '') {
          updateData[key] = value;
        }
      } else if (value !== undefined && value !== null) {
        updateData[key as keyof UpdateAccountRequest] = value;
      }
    }

    this.logger.info(
      `filtered data: {
          username: ${updateData.username || 'N/A'},
          email_address: ${updateData.email_address || 'N/A'},
          phone_number: ${updateData.phone_number || 'N/A'},
          password: ${updateData.password ? '******' : 'N/A'}
        }`,
    );

    const result = await this.prisma.account.update({
      where: {
        account_id: account_id,
      },
      data: updateData,
    });

    return {
      account_id: result.account_id,
      username: result.username,
      email_address: result.email_address,
      phone_number: result.phone_number,
    };
  }

  async deleteAccount(username: string): Promise<void> {
    const existingAccount = await this.prisma.account.findUnique({
      where: {
        username: username,
      },
    });

    if (!existingAccount) {
      this.logger.info('No test account found to delete');
      return;
    }

    try {
      await this.prisma.account.delete({
        where: {
          username: username,
        },
      });
      this.logger.info(
        `Account with username ${username} deleted successfully`,
      );
    } catch (error) {
      this.logger.error(`Error deleting account ${username}`, error);
    }
  }
}
