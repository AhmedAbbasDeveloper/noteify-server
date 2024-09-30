import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { AccessTokenDto } from './dto';
import { LocalAuthGuard } from './local-auth.guard';

import { CurrentUser } from '../decorators/user.decorator';
import { CreateUserDto } from '../users/dto';
import { User } from '../users/user.schema';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@CurrentUser() currentUser: Partial<User>): AccessTokenDto {
    return this.authService.login(currentUser);
  }

  @Post('register')
  async register(
    @Body() { firstName, lastName, email, password }: CreateUserDto,
  ): Promise<AccessTokenDto> {
    try {
      return this.authService.register({
        firstName,
        lastName,
        email: email.toLowerCase(),
        password,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
