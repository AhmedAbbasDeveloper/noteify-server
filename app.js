import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import {
  connect, model, Schema,
} from 'mongoose';

const app = express();

app.use(cors());
app.use(express.json());

connect(process.env.DATABASE_URL);

const noteSchema = new Schema(
  {
    title: String,
    content: String,
  },
  { timestamps: true },
);
const Note = model('Note', noteSchema);

// find all notes
app.get('/notes', async (_req, res) => {
  try {
    return res.send(await Note.find().sort({ createdAt: 'asc' }));
  } catch (error) {
    return res.status(500).send(error);
  }
});

// create a new note
app.post('/notes', async (req, res) => {
  const { title, content } = req.body;

  if (!title && !content) {
    return res.status(400).send({ message: 'Please add a title or content to your note.' });
  }

  try {
    return res.send(await Note.create({ title, content }));
  } catch (error) {
    return res.status(500).send(error);
  }
});

// delete a note by its id
app.delete('/notes/:id', async (req, res) => {
  const { id } = req.params;

  try {
    return res.send(await Note.findByIdAndDelete(id));
  } catch (error) {
    return res.status(500).send(error);
  }
});

app.listen(4000, () => {
  console.log('Server running on port 4000.');
});
