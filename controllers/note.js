import Note from '../models/note.js';

export const getNotes = async (req, res) => {
  try {
    return res.send(await Note.find({ userId: req.user._id }).sort({ createdAt: 'asc' }));
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
    return res.send(await Note.create({ title, content, userId: req.user._id }));
  } catch (error) {
    return res.status(500).send(error);
  }
};

export const updateNote = async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  if (!title && !content) {
    return res.status(400).send({ message: 'Please add a title or content to your note.' });
  }

  try {
    return res.send(await Note.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { title, content },
      { new: true },
    ));
  } catch (error) {
    return res.status(500).send(error);
  }
};

export const deleteNote = async (req, res) => {
  const { id } = req.params;

  try {
    return res.send(await Note.findOneAndDelete({ _id: id, userId: req.user._id }));
  } catch (error) {
    return res.status(500).send(error);
  }
};
