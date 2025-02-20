import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { NoteDto } from '@/notes/dto/note.dto';
import { Note, NoteDocument } from '@/notes/schemas/note.schema';

@Injectable()
export class NotesService {
  constructor(
    @InjectModel(Note.name) private readonly noteModel: Model<NoteDocument>,
  ) {}

  async findAllByUserId(creatorId: string): Promise<NoteDocument[]> {
    return this.noteModel.find({ creatorId }).sort({ updatedAt: -1 }).exec();
  }

  async create(
    { title, content }: NoteDto,
    creatorId: string,
  ): Promise<NoteDocument> {
    return this.noteModel.create({ title, content, creatorId });
  }

  async findOneAndUpdate(
    id: string,
    { title, content }: NoteDto,
    creatorId: string,
  ): Promise<NoteDocument | null> {
    return this.noteModel
      .findOneAndUpdate(
        { _id: id, creatorId },
        { title, content },
        { new: true },
      )
      .exec();
  }

  async findOneAndDelete(
    id: string,
    creatorId: string,
  ): Promise<NoteDocument | null> {
    return this.noteModel.findOneAndDelete({ _id: id, creatorId }).exec();
  }
}
