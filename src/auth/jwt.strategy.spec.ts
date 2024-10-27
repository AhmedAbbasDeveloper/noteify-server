import { faker } from '@faker-js/faker';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';

import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test_secret'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
  });

  describe('validate', () => {
    it('should return a current user document when given a valid payload', async () => {
      const payload = {
        sub: new Types.ObjectId().toString(),
        email: faker.internet.email(),
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
      };

      const result = await jwtStrategy.validate(payload);

      expect(result).toEqual({
        id: payload.sub,
        email: payload.email,
      });
    });
  });
});
