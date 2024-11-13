import { faker } from '@faker-js/faker';
import { ConflictException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model, Types } from 'mongoose';

import { CreateUserDto } from '@/users/dto/create-user.dto';
import { User, UserDocument } from '@/users/schemas/user.schema';
import { UsersService } from '@/users/users.service';

describe('UsersService', () => {
  let usersService: UsersService;
  let userModel: Model<UserDocument>;

  const mockUserModel: Partial<Model<UserDocument>> = {
    findOne: jest.fn(),
    exists: jest.fn(),
    create: jest.fn(),
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
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findOneByEmail', () => {
    it('should return a user if found', async () => {
      const email = faker.internet.email();
      const foundUser = generateUser({ email });

      jest.spyOn(userModel, 'findOne').mockResolvedValueOnce(foundUser);

      const result = await usersService.findOneByEmail(email);

      expect(result).toEqual(foundUser);
      expect(userModel.findOne).toHaveBeenCalledWith({ email });
    });

    it('should return null if no user is found', async () => {
      const email = faker.internet.email();

      jest.spyOn(userModel, 'findOne').mockResolvedValueOnce(null);

      const result = await usersService.findOneByEmail(email);

      expect(result).toBeNull();
      expect(userModel.findOne).toHaveBeenCalledWith({ email });
    });
  });

  describe('create', () => {
    it('should successfully create a new user when email is not taken', async () => {
      const createUserInput: CreateUserDto = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      };
      const createdUser = generateUser(createUserInput);

      jest.spyOn(userModel, 'exists').mockResolvedValueOnce(null);
      jest.spyOn(userModel, 'create').mockResolvedValueOnce(createdUser as any);

      const result = await usersService.create(createUserInput);

      expect(result).toEqual(createdUser);
      expect(userModel.exists).toHaveBeenCalledWith({
        email: createUserInput.email,
      });
      expect(userModel.create).toHaveBeenCalledWith(createUserInput);
    });

    it('should throw a ConflictException if the email is already taken', async () => {
      const createUserInput: CreateUserDto = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      };
      const createdUser = generateUser(createUserInput);

      jest
        .spyOn(userModel, 'exists')
        .mockResolvedValueOnce({ _id: createdUser._id });

      await expect(usersService.create(createUserInput)).rejects.toThrow(
        ConflictException,
      );
      expect(userModel.exists).toHaveBeenCalledWith({
        email: createUserInput.email,
      });
      expect(userModel.create).not.toHaveBeenCalled();
    });
  });
});
