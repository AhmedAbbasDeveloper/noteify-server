import 'dotenv/config';
import { compare, hash } from 'bcrypt';
import cors from 'cors';
import express from 'express';
import jwt from 'jsonwebtoken';
import {
  connect, model, Schema,
} from 'mongoose';
import validator from 'validator';

const app = express();

app.use(cors());
app.use(express.json());

connect(process.env.DATABASE_URL);

const userSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true },
);
const User = model('User', userSchema);

const noteSchema = new Schema(
  {
    title: String,
    content: String,
  },
  { timestamps: true },
);
const Note = model('Note', noteSchema);

// sign up user
app.post('/users/sign-up', async (req, res) => {
  const {
    firstName, lastName, email, password,
  } = req.body;

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).send({ message: 'Please fill out all fields' });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).send({ message: 'Invalid email' });
  }

  if (!validator.isStrongPassword(password)) {
    return res.status(400).send({ message: 'Password must be at least 8 characters long and contain at least one uppercase letter, lowercase letter, number and symbol' });
  }

  try {
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).send({ message: 'Email already registered. Please login instead' });
    }

    const hashedPassword = await hash(password, 10);
    const user = await User.create({
      firstName, lastName, email, password: hashedPassword,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    return res.send({ token });
  } catch (error) {
    return res.status(500).send(error);
  }
});

// login user
app.post('/users/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({ message: 'Please fill out all fields' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send({ message: 'Invalid credentials' });
    }

    const valid = await compare(password, user.password);
    if (!valid) {
      return res.status(400).send({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    return res.send({ token });
  } catch (error) {
    return res.status(500).send(error);
  }
});

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
