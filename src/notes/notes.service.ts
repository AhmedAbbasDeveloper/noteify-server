import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Note, NoteDocument } from './note.schema';
import { CreateNoteDto, UpdateNoteDto } from './dto';

@Injectable()
export class NotesService {
  constructor(
    @InjectModel(Note.name) private readonly noteModel: Model<NoteDocument>,
  ) {}

  async findAllByUser(userId: string): Promise<Note[]> {
    return this.noteModel.find({ userId }, null, { sort: { createdAt: 1 } });
  }

  async create(
    { title, content }: CreateNoteDto,
    userId: string,
  ): Promise<Note> {
    if (!title && !content) {
      throw new Error('Please add a title or content to your note.');
    }

    return this.noteModel.create({ title, content, userId });
  }

  async update(
    id: string,
    { title, content }: UpdateNoteDto,
    userId: string,
  ): Promise<Note | null> {
    if (!title && !content) {
      throw new Error('Please add a title or content to your note.');
    }

    return this.noteModel.findOneAndUpdate(
      { _id: id, userId },
      { title, content },
      { new: true },
    );
  }

  async remove(id: string, userId: string): Promise<Note | null> {
    return this.noteModel.findOneAndDelete({ _id: id, userId });
  }
}
