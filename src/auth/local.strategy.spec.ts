import { faker } from '@faker-js/faker';
import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';

import { AuthService } from '@/auth/auth.service';
import { LocalStrategy } from '@/auth/local.strategy';
import { UserDocument } from '@/users/schemas/user.schema';

describe('LocalStrategy', () => {
  let localStrategy: LocalStrategy;
  let authService: jest.Mocked<AuthService>;

  const mockAuthService = { validateUser: jest.fn() };

  const generateUser = (overrides = {}) =>
    ({
      _id: new Types.ObjectId(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      ...overrides,
    }) as UserDocument;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    localStrategy = module.get<LocalStrategy>(LocalStrategy);
    authService = module.get<jest.Mocked<AuthService>>(AuthService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('validate', () => {
    it('should return a user when credentials are valid', async () => {
      const email = faker.internet.email();
      const password = faker.internet.password();
      const foundUser = generateUser({ email, password: '' });

      jest.spyOn(authService, 'validateUser').mockResolvedValue(foundUser);

      const result = await localStrategy.validate(email, password);

      expect(result).toEqual(foundUser);
      expect(authService.validateUser).toHaveBeenCalledWith(
        email.toLowerCase(),
        password,
      );
    });

    it('should throw an UnauthorizedException when credentials are invalid', async () => {
      const email = faker.internet.email();
      const password = faker.internet.password();

      jest.spyOn(authService, 'validateUser').mockResolvedValue(null);

      await expect(localStrategy.validate(email, password)).rejects.toThrow(
        new UnauthorizedException(
          'Invalid email or password. Please check your credentials and try again.',
        ),
      );
      expect(authService.validateUser).toHaveBeenCalledWith(
        email.toLowerCase(),
        password,
      );
    });
  });
});
