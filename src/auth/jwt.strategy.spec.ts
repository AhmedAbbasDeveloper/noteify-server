import { faker } from '@faker-js/faker';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';

import { JwtStrategy } from '@/auth/jwt.strategy';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;

  const mockConfigService = { get: jest.fn().mockReturnValue('test') };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('validate', () => {
    it('should return user data from payload', () => {
      const payload = {
        sub: new Types.ObjectId().toString(),
        email: faker.internet.email(),
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
      };

      const result = jwtStrategy.validate(payload);

      expect(result).toEqual({
        id: payload.sub,
        email: payload.email,
      });
    });
  });
});
