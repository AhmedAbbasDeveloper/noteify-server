import { faker } from '@faker-js/faker';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { compare, hash } from 'bcryptjs';
import { AlreadyInUseError } from 'common-errors';
import { Types } from 'mongoose';

import { AuthService } from '@/auth/auth.service';
import { UserDocument } from '@/users/schemas/user.schema';
import { UsersService } from '@/users/users.service';

jest.mock('bcryptjs', () => ({ hash: jest.fn(), compare: jest.fn() }));

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let usersService: UsersService;

  const mockJwtService = { sign: jest.fn() };
  const mockUsersService = { findOneByEmail: jest.fn(), create: jest.fn() };

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
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user for valid credentials', async () => {
      const email = faker.internet.email();
      const password = faker.internet.password();
      const foundUser = generateUser({ email, password });

      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(foundUser);
      (compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.validateUser(email, password);

      expect(result).toEqual(foundUser);
      expect(usersService.findOneByEmail).toHaveBeenCalledWith(email);
    });

    it('should return null when user is not found', async () => {
      const email = faker.internet.email();
      const password = faker.internet.password();

      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(null);

      const result = await authService.validateUser(email, password);

      expect(result).toBeNull();
      expect(usersService.findOneByEmail).toHaveBeenCalledWith(email);
    });

    it('should return null for invalid credentials', async () => {
      const email = faker.internet.email();
      const password = faker.internet.password();
      const foundUser = generateUser({ email });

      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(foundUser);
      (compare as jest.Mock).mockResolvedValue(false);

      const result = await authService.validateUser(email, password);

      expect(result).toBeNull();
      expect(usersService.findOneByEmail).toHaveBeenCalledWith(email);
    });
  });

  describe('login', () => {
    it('should return an access token', () => {
      const user = generateUser();
      const token = faker.string.alphanumeric(32);

      jest.spyOn(jwtService, 'sign').mockReturnValue(token);

      const result = authService.login(user);

      expect(result).toEqual({ access_token: token });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: user._id,
        email: user.email,
      });
    });
  });

  describe('register', () => {
    it('should register a new user and return an access token', async () => {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = faker.internet.email();
      const password = faker.internet.password();
      const hashedPassword = `hashed-${password}`;
      const createdUser = generateUser({
        firstName,
        lastName,
        email,
        password: hashedPassword,
      });
      const token = faker.string.alphanumeric(32);

      (hash as jest.Mock).mockResolvedValue(hashedPassword);
      jest.spyOn(usersService, 'create').mockResolvedValue(createdUser);
      jest.spyOn(authService, 'login').mockReturnValue({ access_token: token });

      const result = await authService.register({
        firstName,
        lastName,
        email,
        password,
      });

      expect(result).toEqual({ access_token: token });
      expect(hash).toHaveBeenCalledWith(password, 10);
      expect(usersService.create).toHaveBeenCalledWith({
        firstName,
        lastName,
        email,
        password: hashedPassword,
      });
      expect(authService.login).toHaveBeenCalledWith(createdUser);
    });

    it('should throw an AlreadyInUseError if user already exists', async () => {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = faker.internet.email();
      const password = faker.internet.password();
      const hashedPassword = `hashed-${password}`;
      const conflictError = new AlreadyInUseError('User');

      (hash as jest.Mock).mockResolvedValue(hashedPassword);
      jest.spyOn(usersService, 'create').mockRejectedValue(conflictError);
      jest.spyOn(authService, 'login');

      await expect(
        authService.register({ firstName, lastName, email, password }),
      ).rejects.toThrow(conflictError);
      expect(usersService.create).toHaveBeenCalledWith({
        firstName,
        lastName,
        email,
        password: hashedPassword,
      });
      expect(authService.login).not.toHaveBeenCalled();
    });
  });
});
