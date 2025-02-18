import {
  Body,
  ConflictException,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AlreadyInUseError } from 'common-errors';

import { AuthService } from '@/auth/auth.service';
import { AccessTokenDto } from '@/auth/dto/access-token.dto';
import { LocalAuthGuard } from '@/auth/local-auth.guard';
import { CurrentUser } from '@/decorators/current-user.decorator';
import { CreateUserDto } from '@/users/dto/create-user.dto';
import { UserDocument } from '@/users/schemas/user.schema';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@CurrentUser() currentUser: UserDocument): AccessTokenDto {
    return this.authService.login(currentUser);
  }

  @Post('register')
  async register(
    @Body() { firstName, lastName, email, password }: CreateUserDto,
  ): Promise<AccessTokenDto> {
    try {
      return await this.authService.register({
        firstName,
        lastName,
        email,
        password,
      });
    } catch (error) {
      if (error instanceof AlreadyInUseError) {
        throw new ConflictException(
          'An account with this email already exists. Please log in or use a different email to register.',
        );
      }
      throw error;
    }
  }
}
