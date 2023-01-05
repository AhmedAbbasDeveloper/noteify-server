import {
  BadRequestException,
  Body,
  Controller,
  Request,
  Post,
  UseGuards,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';

import { AccessTokenDto } from './dto';
import { CreateUserDto } from '../users/dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() req): AccessTokenDto {
    return this.authService.login(req.user);
  }

  @Post('register')
  async register(
    @Body() { firstName, lastName, email, password }: CreateUserDto,
  ): Promise<AccessTokenDto> {
    try {
      return this.authService.register({
        firstName,
        lastName,
        email,
        password,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
