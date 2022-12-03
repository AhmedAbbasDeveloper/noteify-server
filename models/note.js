import { model, Schema } from 'mongoose';

const noteSchema = new Schema(
  {
    title: String,
    content: String,
    userId: { type: Schema.Types.ObjectID, required: true },
  },
  { timestamps: true },
);

export default model('Note', noteSchema);
