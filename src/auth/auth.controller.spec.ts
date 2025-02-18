import { faker } from '@faker-js/faker';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AlreadyInUseError } from 'common-errors';
import { Types } from 'mongoose';

import { AuthController } from '@/auth/auth.controller';
import { AuthService } from '@/auth/auth.service';
import { UserDocument } from '@/users/schemas/user.schema';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockAuthService = { login: jest.fn(), register: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return an access token', () => {
      const user = {
        _id: new Types.ObjectId(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
      } as UserDocument;
      const token = faker.string.alphanumeric(32);

      jest.spyOn(authService, 'login').mockReturnValue({ access_token: token });

      const result = authController.login(user);

      expect(result).toEqual({ access_token: token });
      expect(authService.login).toHaveBeenCalledWith(user);
    });
  });

  describe('register', () => {
    it('should register a new user and return an access token', async () => {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = faker.internet.email();
      const password = faker.internet.password();
      const token = faker.string.alphanumeric(32);

      jest
        .spyOn(authService, 'register')
        .mockResolvedValue({ access_token: token });

      const result = await authController.register({
        firstName,
        lastName,
        email,
        password,
      });

      expect(result).toEqual({ access_token: token });
      expect(authService.register).toHaveBeenCalledWith({
        firstName,
        lastName,
        email,
        password,
      });
    });

    it('should throw a BadRequestException if the email is already taken', async () => {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = faker.internet.email();
      const password = faker.internet.password();

      jest
        .spyOn(authService, 'register')
        .mockRejectedValue(new AlreadyInUseError('User'));

      await expect(
        authController.register({ firstName, lastName, email, password }),
      ).rejects.toThrow(
        new BadRequestException(
          'An account with this email already exists. Please log in or use a different email to register.',
        ),
      );
    });
  });
});
