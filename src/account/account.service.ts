import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AccountResponse,
  LoginAccountRequest,
  RegisterAccountRequest,
  UpdateAccountRequest,
} from 'src/model/account.model';
import { PrismaService } from 'src/prisma.service';
import { Account } from '@prisma/client';
import { CreateAccountSchema, LoginAccountSchema } from './account.validation';
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
      throw new NotFoundException(
        `Account with username ${email_address} not found`,
      );
    }

    const isPasswordValid = await bcrypt.compare(password, account.password);

    if (!isPasswordValid) {
      throw new HttpException('Invalid password', 401);
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
      throw new BadRequestException({
        message: `Account with username ${username} already exists`,
        errors: [
          {
            field: 'username',
            message: 'This username is already in use',
          },
        ],
      });
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
    Account: Account,
    request: UpdateAccountRequest,
  ): Promise<AccountResponse> {
    const { username, email_address, phone_number } =
      CreateAccountSchema.parse(request);

    if (username) {
      Account.username = username;
    }

    if (email_address) {
      Account.email_address = email_address;
    }

    if (phone_number) {
      Account.phone_number = phone_number;
    }

    const result = await this.prisma.account.update({
      where: {
        username: Account.username,
      },
      data: Account,
    });

    return {
      account_id: result.account_id,
      username: result.username,
      email_address: result.email_address,
      phone_number: result.phone_number,
    };
  }
}
