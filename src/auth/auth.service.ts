import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';

import { AccessTokenDto } from './dto';

import { User } from '../users/user.schema';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findOneByEmail(email);
    const valid = user && (await compare(password, user.password));
    if (!valid) {
      return null;
    }

    user.password = undefined;
    return user;
  }

  login(user: User | Partial<User>): AccessTokenDto {
    return {
      access_token: this.jwtService.sign({ email: user.email, sub: user.id }),
    };
  }

  async register({
    firstName,
    lastName,
    email,
    password,
  }: CreateUserDto): Promise<AccessTokenDto> {
    const exists = await this.usersService.findOneByEmail(email);
    if (exists) {
      throw new Error('Email already registered. Please login instead.');
    }

    const user = await this.usersService.create({
      firstName,
      lastName,
      email,
      password: await hash(password, 10),
    });

    return this.login(user);
  }
}
