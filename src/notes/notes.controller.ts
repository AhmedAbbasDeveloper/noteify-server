import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { NotFoundError } from 'common-errors';

import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { CurrentUser } from '@/decorators/current-user.decorator';
import { NoteDto } from '@/notes/dto/note.dto';
import { NotesService } from '@/notes/notes.service';
import { NoteDocument } from '@/notes/schemas/note.schema';
import { ObjectIdValidationPipe } from '@/pipes/object-id-validation.pipe';
import { CurrentUserDocument } from '@/users/schemas/current-user.schema';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAllByUser(
    @CurrentUser() currentUser: CurrentUserDocument,
  ): Promise<NoteDocument[]> {
    return this.notesService.findAllByUserId(currentUser.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @CurrentUser() currentUser: CurrentUserDocument,
    @Body() { title, content }: NoteDto,
  ): Promise<NoteDocument> {
    return this.notesService.create({ title, content }, currentUser.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @CurrentUser() currentUser: CurrentUserDocument,
    @Param('id', ObjectIdValidationPipe) id: string,
    @Body() { title, content }: NoteDto,
  ): Promise<NoteDocument> {
    try {
      return await this.notesService.update(
        id,
        { title, content },
        currentUser.id,
      );
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new NotFoundException('Note not found');
      }
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(
    @CurrentUser() currentUser: CurrentUserDocument,
    @Param('id', ObjectIdValidationPipe) id: string,
  ): Promise<NoteDocument> {
    try {
      return await this.notesService.remove(id, currentUser.id);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new NotFoundException('Note not found');
      }
      throw error;
    }
  }
}
