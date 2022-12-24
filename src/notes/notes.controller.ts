import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
} from '@nestjs/common';

import { NoteDocument } from './note.schema';
import { NotesService } from './notes.service';

import { CreateNoteDto } from './dto';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  async findAll(): Promise<NoteDocument[]> {
    return await this.notesService.findAll();
  }

  @Post()
  async create(
    @Body() { title, content }: CreateNoteDto,
  ): Promise<NoteDocument> {
    try {
      return await this.notesService.create({ title, content });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<NoteDocument> {
    return await this.notesService.remove(id);
  }
}
