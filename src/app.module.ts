import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { AccountController } from './account/account.controller';
import { AccountService } from './account/account.service';

@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message }) => {
              let formattedMessage = message;
              if (typeof message === 'object') {
                formattedMessage = JSON.stringify(message, null, 2);
              }
              return `${String(timestamp)} [${level}]: ${String(formattedMessage)}`;
            }),
          ),
        }),
        new winston.transports.File({
          filename: 'application.log',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
      ],
    }),
  ],
  controllers: [AccountController],
  providers: [AppService, PrismaService, AccountService],
})
export class AppModule {}
