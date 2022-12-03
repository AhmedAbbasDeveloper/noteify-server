import express from 'express';

import { getNotes, createNote, deleteNote } from '../controllers/note.js';

const router = express.Router();

router.get('/', getNotes);
router.post('/', createNote);
router.delete('/:id', deleteNote);

export default router;
