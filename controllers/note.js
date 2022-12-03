import Note from '../models/note.js';

export const getNotes = async (_req, res) => {
  try {
    return res.send(await Note.find().sort({ createdAt: 'asc' }));
  } catch (error) {
    return res.status(500).send(error);
  }
};

export const createNote = async (req, res) => {
  const { title, content } = req.body;

  if (!title && !content) {
    return res.status(400).send({ message: 'Please add a title or content to your note.' });
  }

  try {
    return res.send(await Note.create({ title, content }));
  } catch (error) {
    return res.status(500).send(error);
  }
};

export const deleteNote = async (req, res) => {
  const { id } = req.params;

  try {
    return res.send(await Note.findByIdAndDelete(id));
  } catch (error) {
    return res.status(500).send(error);
  }
};
