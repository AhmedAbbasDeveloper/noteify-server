import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, UserDocument } from './user.schema';
import { CreateUserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email });
  }

  async create({
    firstName,
    lastName,
    email,
    password,
  }: CreateUserDto): Promise<User> {
    return this.userModel.create({
      firstName,
      lastName,
      email,
      password,
    });
  }
}
