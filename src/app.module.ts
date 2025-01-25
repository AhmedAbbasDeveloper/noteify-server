import * as toJson from '@meanie/mongoose-to-json';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import mongoose from 'mongoose';

import { AuthModule } from '@/auth/auth.module';
import { NotesModule } from '@/notes/notes.module';
import { UsersModule } from '@/users/users.module';

mongoose.plugin(toJson as Parameters<typeof mongoose.plugin>[0]);

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('DATABASE_URL'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    NotesModule,
    UsersModule,
  ],
})
export class AppModule {}
