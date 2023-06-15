import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

import { User } from '../users/user.schema';

export type NoteDocument = HydratedDocument<Note>;

@Schema({ timestamps: true })
export class Note {
  id: string;

  @Prop()
  title: string;

  @Prop()
  content: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: User;

  createdAt: Date;

  updatedAt: Date;
}

export const NoteSchema = SchemaFactory.createForClass(Note);
