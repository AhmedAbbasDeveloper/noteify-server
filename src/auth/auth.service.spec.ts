import { faker } from '@faker-js/faker';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { hash } from 'bcryptjs';

import { AuthService } from './auth.service';

import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: DeepMocked<JwtService>;
  let usersService: DeepMocked<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    })
      .useMocker(createMock)
      .compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get(JwtService);
    usersService = module.get(UsersService);
  });

  describe('validateUser', () => {
    it('returns null when user is not found', async () => {
      const email = faker.internet.email();
      const password = faker.internet.password();

      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValueOnce(null);

      const validateUser = await authService.validateUser(email, password);

      expect(validateUser).toBeNull();
    });

    it('returns null when password is invalid', async () => {
      const email = faker.internet.email();
      const password = faker.internet.password();

      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValueOnce({
        id: faker.string.uuid(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email,
        password: faker.internet.password(),
        createdAt: faker.date.past(),
        updatedAt: faker.date.past(),
      });

      const validateUser = await authService.validateUser(email, password);

      expect(validateUser).toBeNull();
    });

    it('returns user when password is valid', async () => {
      const email = faker.internet.email();
      const password = faker.internet.password();

      const user = {
        id: faker.string.uuid(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email,
        password: await hash(password, 10),
        createdAt: faker.date.past(),
        updatedAt: faker.date.past(),
      };

      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValueOnce(user);

      const validateUser = await authService.validateUser(email, password);

      expect(validateUser).toBe(user);
    });

    it('returns user without password', async () => {
      const email = faker.internet.email();
      const password = faker.internet.password();

      const user = {
        id: faker.string.uuid(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email,
        password: await hash(password, 10),
        createdAt: faker.date.past(),
        updatedAt: faker.date.past(),
      };

      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValueOnce(user);

      const validateUser = await authService.validateUser(email, password);

      expect(validateUser?.password).toBeUndefined();
    });
  });

  describe('login', () => {
    it('returns access token', () => {
      const user = {
        id: faker.string.uuid(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        createdAt: faker.date.past(),
        updatedAt: faker.date.past(),
      };

      authService.login(user);

      expect(jwtService.sign).toHaveBeenCalledWith({
        email: user.email,
        sub: user.id,
      });
    });
  });

  describe('register', () => {
    it('throws error when user already exists', async () => {
      const createUserInput = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValueOnce({
        id: faker.string.uuid(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: createUserInput.email,
        password: await hash(createUserInput.password, 10),
        createdAt: faker.date.past(),
        updatedAt: faker.date.past(),
      });

      expect(authService.register(createUserInput)).rejects.toThrowError(
        'Email already registered. Please login instead.',
      );
    });

    it('creates user', async () => {
      const createUserInput = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      const user = {
        id: faker.string.uuid(),
        firstName: createUserInput.firstName,
        lastName: createUserInput.lastName,
        email: createUserInput.email,
        password: await hash(createUserInput.password, 10),
        createdAt: faker.date.past(),
        updatedAt: faker.date.past(),
      };

      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValueOnce(null);
      jest.spyOn(usersService, 'create').mockResolvedValueOnce(user);
      jest
        .spyOn(authService, 'login')
        .mockReturnValue({ access_token: faker.string.alphanumeric() });

      await authService.register(createUserInput);

      expect(authService.login).toBeCalledWith(user);
    });
  });
});
