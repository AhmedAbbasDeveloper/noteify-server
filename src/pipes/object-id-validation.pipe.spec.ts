import { faker } from '@faker-js/faker';
import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

import { ObjectIdValidationPipe } from './object-id-validation.pipe';

describe('ObjectIdValidationPipe', () => {
  let pipe: ObjectIdValidationPipe;

  beforeEach(() => {
    pipe = new ObjectIdValidationPipe();
  });

  it('should return the value if it is a valid ObjectID', () => {
    const id = new Types.ObjectId().toString();

    expect(pipe.transform(id)).toBe(id);
  });

  it('should throw a BadRequestException if the ObjectID is invalid', () => {
    const id = faker.string.alphanumeric(10);

    expect(() => pipe.transform(id)).toThrow(BadRequestException);
  });
});
