import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { NotFoundError } from 'common-errors';
import { Model } from 'mongoose';

import { NoteDto } from '@/notes/dto/note.dto';
import { Note, NoteDocument } from '@/notes/schemas/note.schema';

@Injectable()
export class NotesService {
  constructor(
    @InjectModel(Note.name) private readonly noteModel: Model<NoteDocument>,
  ) {}

  async findAllByUserId(creatorId: string): Promise<NoteDocument[]> {
    return this.noteModel.find({ creatorId }).sort({ updatedAt: -1 });
  }

  async create(
    { title, content }: NoteDto,
    creatorId: string,
  ): Promise<NoteDocument> {
    return this.noteModel.create({ title, content, creatorId });
  }

  async update(
    id: string,
    { title, content }: NoteDto,
    creatorId: string,
  ): Promise<NoteDocument> {
    const updatedNote = await this.noteModel.findOneAndUpdate(
      { _id: id, creatorId },
      { title, content },
      { new: true },
    );

    if (!updatedNote) {
      throw new NotFoundError('Note');
    }

    return updatedNote;
  }

  async remove(id: string, creatorId: string): Promise<NoteDocument> {
    const deletedNote = await this.noteModel.findOneAndDelete({
      _id: id,
      creatorId,
    });

    if (!deletedNote) {
      throw new NotFoundError('Note');
    }

    return deletedNote;
  }
}
