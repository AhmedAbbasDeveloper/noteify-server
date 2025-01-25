import { faker } from '@faker-js/faker';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';

import { JwtStrategy } from '@/auth/jwt.strategy';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let configService: ConfigService;

  const mockConfigService = { get: jest.fn() };

  beforeEach(async () => {
    mockConfigService.get.mockReturnValue('test');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should throw error if JWT_SECRET is not defined', () => {
      jest.spyOn(configService, 'get').mockReturnValue(undefined);

      expect(() => new JwtStrategy(configService)).toThrow(
        'JWT_SECRET is not defined',
      );
    });

    it('should initialize strategy with correct config when JWT_SECRET is provided', () => {
      expect(new JwtStrategy(configService)).toBeDefined();
    });
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
