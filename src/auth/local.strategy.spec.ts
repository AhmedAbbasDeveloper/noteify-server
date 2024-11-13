import { faker } from '@faker-js/faker';
import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';

import { AuthService } from '@/auth/auth.service';
import { LocalStrategy } from '@/auth/local.strategy';

describe('LocalStrategy', () => {
  let localStrategy: LocalStrategy;
  let authService: AuthService;

  const mockAuthService = {
    validateUser: jest.fn(),
  };

  const generateUser = (overrides = {}) => ({
    _id: new Types.ObjectId(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    ...overrides,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    localStrategy = module.get<LocalStrategy>(LocalStrategy);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validate', () => {
    it('should return a user if credentials are valid', async () => {
      const email = faker.internet.email();
      const password = faker.internet.password();
      const foundUser = generateUser({ email, password: undefined });

      jest
        .spyOn(authService, 'validateUser')
        .mockResolvedValueOnce(foundUser as any);

      const result = await localStrategy.validate(email, password);

      expect(result).toEqual(foundUser);
      expect(authService.validateUser).toHaveBeenCalledWith(
        email.toLowerCase(),
        password,
      );
    });

    it('should throw an UnauthorizedException if user is not found', async () => {
      const email = faker.internet.email();
      const password = faker.internet.password();

      jest.spyOn(authService, 'validateUser').mockResolvedValueOnce(null);

      await expect(localStrategy.validate(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.validateUser).toHaveBeenCalledWith(
        email.toLowerCase(),
        password,
      );
    });
  });
});
