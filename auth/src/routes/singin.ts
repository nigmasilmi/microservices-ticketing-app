import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { body } from 'express-validator';
import { validateRequest } from '../middlewares/validate-request';
import { User } from '../models/user';
import { BadRequestError } from '../errors/bad-request-error';
import { Password } from '../services/password';
const router = express.Router();

router.post(
  '/api/users/signin',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('You must supply a password'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    //
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      //
      throw new BadRequestError('Invalid credentials');
    }
    const passwordsMatch = await Password.compare(
      existingUser.password,
      password
    );
    if (!passwordsMatch) {
      throw new BadRequestError('Invalid credentials');
    }
    // generate jwt
    const userJwt = jwt.sign(
      { id: existingUser.id, email: existingUser.email },
      // if we check for the existance ofr JWT_KEY inside here
      // the error will go away but, we need to this earlier (in index.ts)
      // so to let know TS that we already checked, we used the !
      process.env.JWT_KEY!
    );
    // store jwt on session obj
    req.session = {
      jwt: userJwt,
    };
    res.status(200).send(existingUser);
  }
);

export { router as signinRouter };
