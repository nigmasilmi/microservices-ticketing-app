import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
const router = express.Router();
import { body } from 'express-validator';
import { validateRequest } from '../middlewares/validate-request';
import { User } from '../models/user';
import { BadRequestError } from '../errors/bad-request-error';

router.post(
  '/api/users/signup',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('password must be min 4 and max 20 characters'),
  ],
  validateRequest,
  // primer nivel de validación
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // console.log('email in use');
      // return res.send({});
      throw new BadRequestError('Email already in use');
    }
    const user = User.build({ email, password });
    await user.save();
    // generate jwt

    const userJwt = jwt.sign(
      { id: user.id, email: user.email },
      // if we check for the existance ofr JWT_KEY inside here
      // the error will go away but, we need to this earlier (in index.ts)
      // so to let know TS that we already checked, we used the !
      process.env.JWT_KEY!
    );
    // store jwt on session obj
    req.session = {
      jwt: userJwt,
    };
    res.status(201).send(user);
  }
);

export { router as signupRouter };
