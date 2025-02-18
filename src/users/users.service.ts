import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AlreadyInUseError } from 'common-errors';
import { Model } from 'mongoose';

import { CreateUserDto } from '@/users/dto/create-user.dto';
import { User, UserDocument } from '@/users/schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async findOneByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email });
  }

  async create({
    firstName,
    lastName,
    email,
    password,
  }: CreateUserDto): Promise<UserDocument> {
    const existingUser = await this.userModel.exists({ email });
    if (existingUser) {
      throw new AlreadyInUseError('User');
    }

    return this.userModel.create({
      firstName,
      lastName,
      email,
      password,
    });
  }
}
