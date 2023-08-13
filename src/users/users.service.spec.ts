import { faker } from '@faker-js/faker';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';

import { User } from './user.schema';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let usersService: UsersService;

  const userModel = {
    findOne: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: userModel,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
  });

  describe('findOneByEmail', () => {
    it('finds user by email', async () => {
      const email = faker.internet.email();

      await usersService.findOneByEmail(email);

      expect(userModel.findOne).toHaveBeenCalledWith({ email });
    });
  });

  describe('create', () => {
    it('creates user', async () => {
      const createUserInput = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      await usersService.create(createUserInput);

      expect(userModel.create).toHaveBeenCalledWith(createUserInput);
    });
  });
});
