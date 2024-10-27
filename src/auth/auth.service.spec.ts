import { faker } from '@faker-js/faker';
import { ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { compare, hash } from 'bcryptjs';
import { Types } from 'mongoose';

import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    findOneByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const token = 'jwtToken';

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
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return a user if credentials are valid', async () => {
      const email = faker.internet.email();
      const password = faker.internet.password();
      const foundUser = generateUser({ email, password });

      jest
        .spyOn(usersService, 'findOneByEmail')
        .mockResolvedValueOnce(foundUser as any);
      (compare as jest.Mock).mockResolvedValueOnce(true);

      const result = await authService.validateUser(email, password);

      expect(result).toEqual(foundUser);
      expect(usersService.findOneByEmail).toHaveBeenCalledWith(email);
    });

    it('should return null if user is not found', async () => {
      const email = faker.internet.email();
      const password = faker.internet.password();

      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValueOnce(null);

      const result = await authService.validateUser(email, password);

      expect(result).toBeNull();
      expect(usersService.findOneByEmail).toHaveBeenCalledWith(email);
    });

    it('should return null if password is invalid', async () => {
      const email = faker.internet.email();
      const password = faker.internet.password();
      const foundUser = generateUser({ email });

      jest
        .spyOn(usersService, 'findOneByEmail')
        .mockResolvedValueOnce(foundUser as any);
      (compare as jest.Mock).mockResolvedValueOnce(false);

      const result = await authService.validateUser(email, password);

      expect(result).toBeNull();
      expect(usersService.findOneByEmail).toHaveBeenCalledWith(email);
    });
  });

  describe('login', () => {
    it('should return a valid access token', async () => {
      const user = generateUser();
      const payload = { sub: user._id, email: user.email };

      jest.spyOn(jwtService, 'sign').mockReturnValue(token);

      const result = await authService.login(user as any);

      expect(result).toEqual({ access_token: token });
      expect(jwtService.sign).toHaveBeenCalledWith(payload);
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
      const hashedPassword = await hash(createUserInput.password, 10);
      const createdUser = generateUser({
        ...createUserInput,
        password: hashedPassword,
      });

      jest
        .spyOn(usersService, 'create')
        .mockResolvedValueOnce(createdUser as any);
      jest.spyOn(jwtService, 'sign').mockReturnValue(token);

      const result = await authService.register(createUserInput);

      expect(result).toEqual({ access_token: token });
      expect(usersService.create).toHaveBeenCalledWith({
        ...createUserInput,
        password: hashedPassword,
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: createdUser._id,
        email: createdUser.email,
      });
    });

    it('should throw a ConflictException if user already exists', async () => {
      const createUserInput: CreateUserDto = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      jest
        .spyOn(usersService, 'create')
        .mockRejectedValueOnce(
          new ConflictException('User with this email already exists.'),
        );

      await expect(authService.register(createUserInput)).rejects.toThrow(
        ConflictException,
      );
      expect(usersService.create).toHaveBeenCalledWith({
        ...createUserInput,
        password: await hash(createUserInput.password, 10),
      });
    });
  });
});
