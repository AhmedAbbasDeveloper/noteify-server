import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';

import { JwtStrategy } from './jwt.strategy';

describe('LocalStrategy', () => {
  let jwtStrategy: JwtStrategy;

  beforeEach(async () => {
    process.env.JWT_SECRET = faker.string.alphanumeric();

    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtStrategy],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
  });

  describe('validate', () => {
    it('validates payload', async () => {
      const payload = {
        email: faker.internet.email(),
        sub: faker.string.uuid(),
        iat: faker.number.int(),
        exp: faker.number.int(),
      };

      const validatedPayload = await jwtStrategy.validate(payload);

      expect(validatedPayload).toEqual({
        email: payload.email,
        id: payload.sub,
      });
    });
  });
});
