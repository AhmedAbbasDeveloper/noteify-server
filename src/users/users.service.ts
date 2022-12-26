import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, UserDocument } from './user.schema';

import { CreateUserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findOne(id: string): Promise<UserDocument> {
    return await this.userModel.findById(id);
  }

  async findByEmail(email: string): Promise<UserDocument | undefined> {
    const lowerCaseEmail = email.toLowerCase();
    return await this.userModel.findOne({ email: lowerCaseEmail });
  }

  async create({
    firstName,
    lastName,
    email,
    password,
  }: CreateUserDto): Promise<UserDocument> {
    const lowerCaseEmail = email.toLowerCase();
    return await this.userModel.create({
      firstName,
      lastName,
      email: lowerCaseEmail,
      password,
    });
  }
}
