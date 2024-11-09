import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument } from './schemas/user.schema';

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
      throw new ConflictException(
        'An account with this email already exists. Please log in or use a different email to register.',
      );
    }

    return this.userModel.create({
      firstName,
      lastName,
      email,
      password,
    });
  }
}
