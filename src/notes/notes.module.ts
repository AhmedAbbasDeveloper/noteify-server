import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { NotesController } from '@/notes/notes.controller';
import { NotesService } from '@/notes/notes.service';
import { Note, NoteSchema } from '@/notes/schemas/note.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Note.name, schema: NoteSchema }]),
  ],
  providers: [NotesService],
  controllers: [NotesController],
})
export class NotesModule {}
