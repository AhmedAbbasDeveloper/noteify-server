import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

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
    const noteData: Partial<NoteDocument> = {
      ...(title ? { title } : {}),
      ...(content ? { content } : {}),
    };

    return this.noteModel.create({ ...noteData, creatorId });
  }

  async update(
    id: string,
    { title, content }: NoteDto,
    creatorId: string,
  ): Promise<NoteDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid note ID format');
    }

    const updateOperation = {
      ...(title ? { title } : { $unset: { title: '' } }),
      ...(content ? { content } : { $unset: { content: '' } }),
    };

    const updatedNote = await this.noteModel.findOneAndUpdate(
      { _id: id, creatorId },
      updateOperation,
      { new: true },
    );

    if (!updatedNote) {
      throw new NotFoundException(`Note not found`);
    }

    return updatedNote;
  }

  async remove(id: string, creatorId: string): Promise<NoteDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid note ID format');
    }

    const deletedNote = await this.noteModel.findOneAndDelete({
      _id: id,
      creatorId,
    });

    if (!deletedNote) {
      throw new NotFoundException(`Note not found`);
    }

    return deletedNote;
  }
}
