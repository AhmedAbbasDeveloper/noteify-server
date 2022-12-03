import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { connect } from 'mongoose';

import userRoutes from './routes/user.js';
import noteRoutes from './routes/note.js';

const app = express();

app.use(cors());
app.use(express.json());

connect(process.env.DATABASE_URL);

app.use('/users', userRoutes);
app.use('/notes', noteRoutes);

app.listen(4000, () => {
  console.log('Server running on port 4000.');
});
