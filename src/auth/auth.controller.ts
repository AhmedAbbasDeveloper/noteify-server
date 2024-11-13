import { Body, Controller, Post, UseGuards } from '@nestjs/common';

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
  async login(
    @CurrentUser() currentUser: UserDocument,
  ): Promise<AccessTokenDto> {
    return this.authService.login(currentUser);
  }

  @Post('register')
  async register(
    @Body() { firstName, lastName, email, password }: CreateUserDto,
  ): Promise<AccessTokenDto> {
    return this.authService.register({
      firstName,
      lastName,
      email,
      password,
    });
  }
}
