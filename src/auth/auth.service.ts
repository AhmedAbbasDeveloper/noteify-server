import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';

import { AccessTokenDto } from './dto';

import { CreateUserDto } from '../users/dto';
import { UserDocument } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserDocument | null> {
    const user = await this.usersService.findOneByEmail(email);

    const valid = user && (await compare(password, user.password));
    if (!valid) {
      return null;
    }

    user.password = undefined;
    return user;
  }

  async login(user: UserDocument): Promise<AccessTokenDto> {
    const payload = { sub: user._id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register({
    firstName,
    lastName,
    email,
    password,
  }: CreateUserDto): Promise<AccessTokenDto> {
    const user = await this.usersService.create({
      firstName,
      lastName,
      email,
      password: await hash(password, 10),
    });

    return this.login(user);
  }
}
