import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '../decorators/user.decorator';

import { Note } from './note.schema';
import { NotesService } from './notes.service';
import { CreateNoteDto, UpdateNoteDto } from './dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../users/user.schema';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAllByUser(
    @CurrentUser() currentUser: Partial<User>,
  ): Promise<Note[]> {
    return this.notesService.findAllByUser(currentUser.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @CurrentUser() currentUser: Partial<User>,
    @Body() { title, content }: CreateNoteDto,
  ): Promise<Note> {
    try {
      return this.notesService.create(
        {
          title,
          content,
        },
        currentUser.id,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @CurrentUser() currentUser: Partial<User>,
    @Param('id') id: string,
    @Body() { title, content }: UpdateNoteDto,
  ): Promise<Note | null> {
    try {
      return this.notesService.update(
        id,
        {
          title,
          content,
        },
        currentUser.id,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(
    @CurrentUser() currentUser: Partial<User>,
    @Param('id') id: string,
  ): Promise<Note | null> {
    return this.notesService.remove(id, currentUser.id);
  }
}
