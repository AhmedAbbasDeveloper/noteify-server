import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Note, NoteSchema } from './note.schema';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Note.name, schema: NoteSchema }]),
  ],
  providers: [NotesService],
  controllers: [NotesController],
})
export class NotesModule {}
