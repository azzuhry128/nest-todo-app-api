// import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
// import { PrismaService } from 'src/prisma.service';
// import { Account } from '@prisma/client';
// // import { CreateAccountSchema, LoginAccountSchema } from './account.validation';
// import * as bcrypt from 'bcrypt';
// import { GetTodoRequest, TodoResponse } from 'src/model/todo.model';
// @Injectable()
// export class TodoService {
//   constructor(private prisma: PrismaService) {}

//   async GetAllTodo(request: GetTodoRequest): Promise<TodoResponse> {
//     const { email_address, password } = LoginAccountSchema.parse(request);
//     const account = await this.prisma.account.findUnique({
//       where: { email_address },
//     });

//     if (!account) {
//       throw new NotFoundException(
//         `Account with username ${email_address} not found`,
//       );
//     }

//     const isPasswordValid = await bcrypt.compare(password, account.password);

//     if (!isPasswordValid) {
//       throw new HttpException('Invalid password', 401);
//     }

//     const accountResponse: AccountResponse = {
//       account_id: account.account_id,
//       username: account.username,
//       email_address: account.email_address,
//       phone_number: account.phone_number,
//     };

//     return accountResponse;
//   }

//   async CreateTodo(request: RegisterAccountRequest): Promise<AccountResponse> {
//     const { username } = CreateAccountSchema.parse(request);
//     const duplicateUsername = await this.prisma.account.findUnique({
//       where: {
//         username,
//       },
//     });

//     if (duplicateUsername) {
//       throw new NotFoundException(
//         `Account with username ${username} already exists`,
//       );
//     }

//     const hashedPassword = await bcrypt.hash(request.password, 10);

//     const account = await this.prisma.account.create({
//       data: {
//         username,
//         email_address: request.email_address,
//         password: hashedPassword,
//         phone_number: request.phone_number,
//       },
//     });

//     return account;
//   }

//   async UpdateTodo(
//     Account: Account,
//     request: UpdateAccountRequest,
//   ): Promise<AccountResponse> {
//     const { username, email_address, phone_number } =
//       CreateAccountSchema.parse(request);

//     if (username) {
//       Account.username = username;
//     }

//     if (email_address) {
//       Account.email_address = email_address;
//     }

//     if (phone_number) {
//       Account.phone_number = phone_number;
//     }

//     const result = await this.prisma.account.update({
//       where: {
//         username: Account.username,
//       },
//       data: Account,
//     });

//     return {
//       account_id: result.account_id,
//       username: result.username,
//       email_address: result.email_address,
//       phone_number: result.phone_number,
//     };
//   }

//   async DeleteTodo();
// }
