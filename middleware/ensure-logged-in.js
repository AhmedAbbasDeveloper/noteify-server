import jwt from 'jsonwebtoken';

import User from '../models/user.js';

export default async function ensureLoggedIn(req, res, next) {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).send({ message: 'Unauthorized' });
  }
  const token = authorization.split(' ')[1];

  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(id);

    if (!user) {
      return res.status(401).send({ message: 'Unauthorized' });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).send({ message: 'Unauthorized' });
  }
}
