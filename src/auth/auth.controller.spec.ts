import { faker } from '@faker-js/faker';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AccessTokenDto } from './dto/access-token.dto';

import { CreateUserDto } from '../users/dto/create-user.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
    validateUser: jest.fn(),
  };

  const mockCurrentUser = {
    _id: new Types.ObjectId().toString(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
  };

  const accessToken: AccessTokenDto = {
    access_token: faker.string.alphanumeric(32),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return an access token for a valid user', async () => {
      jest.spyOn(authService, 'login').mockReturnValue(accessToken as any);

      const result = await authController.login(mockCurrentUser as any);

      expect(result).toEqual(accessToken);
      expect(mockAuthService.login).toHaveBeenCalledWith(mockCurrentUser);
    });
  });

  describe('register', () => {
    it('should register a new user and return an access token', async () => {
      const createUserInput: CreateUserDto = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      jest.spyOn(authService, 'register').mockReturnValue(accessToken as any);

      const result = await authController.register(createUserInput);

      expect(result).toEqual(accessToken);
      expect(mockAuthService.register).toHaveBeenCalledWith(createUserInput);
    });

    it('should throw an error if registration fails', async () => {
      const createUserInput: CreateUserDto = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      jest
        .spyOn(authService, 'register')
        .mockRejectedValue(new BadRequestException('Email already exists'));

      await expect(authController.register(createUserInput)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
