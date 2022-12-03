import { model, Schema } from 'mongoose';

const noteSchema = new Schema(
  { title: String, content: String },
  { timestamps: true },
);

export default model('Note', noteSchema);
