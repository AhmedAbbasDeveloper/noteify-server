import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Note, NoteDocument } from './note.schema';

import { CreateNoteDto } from './dto';

@Injectable()
export class NotesService {
  constructor(@InjectModel(Note.name) private noteModel: Model<NoteDocument>) {}

  async findAll(): Promise<NoteDocument[]> {
    return await this.noteModel.find().sort({ createdAt: 'asc' });
  }

  async create({ title, content }: CreateNoteDto): Promise<NoteDocument> {
    if (!title && !content) {
      throw new Error('Please add a title or content to your note.');
    }

    return await this.noteModel.create({ title, content });
  }

  async remove(id: string): Promise<NoteDocument> {
    return await this.noteModel.findByIdAndDelete(id);
  }
}
