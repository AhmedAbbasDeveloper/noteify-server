import { faker } from '@faker-js/faker';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';

describe('LocalStrategy', () => {
  let localStrategy: LocalStrategy;
  let authService: DeepMocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LocalStrategy],
    })
      .useMocker(createMock)
      .compile();

    localStrategy = module.get<LocalStrategy>(LocalStrategy);
    authService = module.get(AuthService);
  });

  describe('validate', () => {
    it('throws error when user is not found', async () => {
      const email = faker.internet.email();
      const password = faker.internet.password();

      jest.spyOn(authService, 'validateUser').mockResolvedValueOnce(null);

      expect(localStrategy.validate(email, password)).rejects.toThrowError(
        'Unauthorized',
      );
    });

    it('returns user when user is found', async () => {
      const email = faker.internet.email();
      const password = faker.internet.password();

      const user = {
        id: faker.string.uuid(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email,
        password,
        createdAt: faker.date.past(),
        updatedAt: faker.date.past(),
      };

      jest.spyOn(authService, 'validateUser').mockResolvedValueOnce(user);

      const validatedUser = await localStrategy.validate(email, password);

      expect(validatedUser).toEqual(user);
    });
  });
});
