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
  async findOneAndUpdate(
    @CurrentUser() currentUser: CurrentUserDocument,
    @Param('id', ObjectIdValidationPipe) id: string,
    @Body() { title, content }: NoteDto,
  ): Promise<NoteDocument> {
    const note = await this.notesService.findOneAndUpdate(
      id,
      { title, content },
      currentUser.id,
    );

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    return note;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async findOneAndDelete(
    @CurrentUser() currentUser: CurrentUserDocument,
    @Param('id', ObjectIdValidationPipe) id: string,
  ): Promise<NoteDocument> {
    const note = await this.notesService.findOneAndDelete(id, currentUser.id);

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    return note;
  }
}
