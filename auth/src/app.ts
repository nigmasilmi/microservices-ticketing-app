import express from 'express';
import 'express-async-errors';
import cookieSession from 'cookie-session';
import { currentUserRouter } from './routes/current-user';
import { signinRouter } from './routes/singin';
import { signoutRouter } from './routes/signout';
import { signupRouter } from './routes/signup';
import { errorHandler, NotFoundError } from '@ns_micros/tickets-common';

const app = express();
// due to ingress, trust the proxy
app.set('trust proxy', true);
app.use(express.json());
app.use(
  cookieSession({
    // don't use encryption on the cookie
    signed: false,
    // allow connections on https and set cookies only on secure requests
    // remember in postman setting the url to https explicitly
    // also in postman preferences SSL certificate verification must be off
    secure: process.env.NODE_ENV !== 'test',
  })
);
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

app.all('*', async (req, res) => {
  throw new NotFoundError();
});
app.use(errorHandler);

export { app };
