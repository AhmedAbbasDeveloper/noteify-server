import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { NoteDocument } from './note.schema';
import { NotesService } from './notes.service';

import { CreateNoteDto, UpdateNoteDto } from './dto';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAllByUser(@Request() req): Promise<NoteDocument[]> {
    return this.notesService.findAllByUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Request() req,
    @Body() { title, content }: CreateNoteDto,
  ): Promise<NoteDocument> {
    try {
      return this.notesService.create(
        {
          title,
          content,
        },
        req.user.id,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() { title, content }: UpdateNoteDto,
  ): Promise<NoteDocument> {
    try {
      return this.notesService.update(
        id,
        {
          title,
          content,
        },
        req.user.id,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string): Promise<NoteDocument> {
    return this.notesService.remove(id, req.user.id);
  }
}
