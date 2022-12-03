import { compare, hash } from 'bcrypt';
import jwt from 'jsonwebtoken';
import validator from 'validator';

import User from '../models/user.js';

export const signUp = async (req, res) => {
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
};

export const login = async (req, res) => {
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
};
