import express from 'express';

import { signUp, login } from '../controllers/user.js';

const router = express.Router();

router.post('/sign-up', signUp);
router.post('/login', login);

export default router;
