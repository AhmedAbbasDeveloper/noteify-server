import express from 'express';

import { getNotes, createNote, deleteNote } from '../controllers/note.js';

import ensureLoggedIn from '../middleware/ensure-logged-in.js';

const router = express.Router();

router.use(ensureLoggedIn);

router.get('/', getNotes);
router.post('/', createNote);
router.delete('/:id', deleteNote);

export default router;
