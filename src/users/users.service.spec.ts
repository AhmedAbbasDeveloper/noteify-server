import { faker } from '@faker-js/faker';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { AlreadyInUseError } from 'common-errors';
import { Model, Types } from 'mongoose';

import { User, UserDocument } from '@/users/schemas/user.schema';
import { UsersService } from '@/users/users.service';

describe('UsersService', () => {
  let usersService: UsersService;
  let userModel: Model<UserDocument>;

  const mockUserModel = {
    findOne: jest.fn(),
    exists: jest.fn(),
    create: jest.fn(),
  };

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
        UsersService,
        { provide: getModelToken(User.name), useValue: mockUserModel },
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

      jest.spyOn(userModel, 'findOne').mockResolvedValue(foundUser);

      const result = await usersService.findOneByEmail(email);

      expect(result).toEqual(foundUser);
      expect(userModel.findOne).toHaveBeenCalledWith({ email });
    });

    it('should return null if user not found', async () => {
      const email = faker.internet.email();

      jest.spyOn(userModel, 'findOne').mockResolvedValue(null);

      const result = await usersService.findOneByEmail(email);

      expect(result).toBeNull();
      expect(userModel.findOne).toHaveBeenCalledWith({ email });
    });
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = faker.internet.email();
      const password = faker.internet.password();
      const createdUser = generateUser({
        firstName,
        lastName,
        email,
        password,
      });

      jest.spyOn(userModel, 'exists').mockResolvedValue(null);
      jest
        .spyOn(userModel, 'create')
        .mockImplementation(() => Promise.resolve(createdUser as any));

      const result = await usersService.create({
        firstName,
        lastName,
        email,
        password,
      });

      expect(result).toEqual(createdUser);
      expect(userModel.exists).toHaveBeenCalledWith({ email });
      expect(userModel.create).toHaveBeenCalledWith({
        firstName,
        lastName,
        email,
        password,
      });
    });

    it('should throw an AlreadyInUseError if user already exists', async () => {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = faker.internet.email();
      const password = faker.internet.password();

      jest
        .spyOn(userModel, 'exists')
        .mockResolvedValue({ _id: new Types.ObjectId() });

      await expect(
        usersService.create({ firstName, lastName, email, password }),
      ).rejects.toThrow(new AlreadyInUseError('User'));
      expect(userModel.exists).toHaveBeenCalledWith({ email });
      expect(userModel.create).not.toHaveBeenCalled();
    });
  });
});
