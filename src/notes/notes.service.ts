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

  async findAllByUser(userId: string): Promise<NoteDocument[]> {
    return this.noteModel.find({ userId }).sort({ createdAt: 'asc' });
  }

  async create(
    { title, content }: CreateNoteDto,
    userId: string,
  ): Promise<NoteDocument> {
    if (!title && !content) {
      throw new Error('Please add a title or content to your note.');
    }

    return this.noteModel.create({ title, content, userId });
  }

  async update(
    id: string,
    { title, content }: UpdateNoteDto,
    userId: string,
  ): Promise<NoteDocument | null> {
    if (!title && !content) {
      throw new Error('Please add a title or content to your note.');
    }

    return this.noteModel.findOneAndUpdate(
      { _id: id, userId },
      { title, content },
      { new: true },
    );
  }

  async remove(id: string, userId: string): Promise<NoteDocument | null> {
    return this.noteModel.findOneAndDelete({ _id: id, userId });
  }
}
