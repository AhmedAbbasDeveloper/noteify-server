import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Note, NoteDocument } from './note.schema';

import { UsersService } from '../users/users.service';

import { CreateNoteDto, UpdateNoteDto } from './dto';

@Injectable()
export class NotesService {
  constructor(
    @InjectModel(Note.name) private noteModel: Model<NoteDocument>,
    private readonly usersService: UsersService,
  ) {}

  async findAllByUser(user: string): Promise<NoteDocument[]> {
    return await this.noteModel.find({ user }).sort({ createdAt: 'asc' });
  }

  async create(
    { title, content }: CreateNoteDto,
    user: string,
  ): Promise<NoteDocument> {
    if (!title && !content) {
      throw new Error('Please add a title or content to your note.');
    }

    return await this.noteModel.create({ title, content, user });
  }

  async update(
    id: string,
    { title, content }: UpdateNoteDto,
    user: string,
  ): Promise<NoteDocument> {
    if (!title && !content) {
      throw new Error('Please add a title or content to your note.');
    }

    return await this.noteModel.findOneAndUpdate(
      { _id: id, user },
      { title, content },
      { new: true },
    );
  }

  async remove(id: string, user: string): Promise<NoteDocument> {
    return await this.noteModel.findOneAndDelete({ _id: id, user });
  }
}
