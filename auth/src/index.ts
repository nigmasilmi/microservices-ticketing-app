import express from 'express';
import 'express-async-errors';
import { currentUserRouter } from './routes/current-user';
import { signinRouter } from './routes/singin';
import { signoutRouter } from './routes/signout';
import { signupRouter } from './routes/signup';
import { errorHandler } from './middlewares/error-handler';
import { NotFoundError } from './errors/not-found-error';

const app = express();

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

app.use(errorHandler);
app.get('*', async (req, res) => {
  throw new NotFoundError();
});

app.listen(3000, () => {
  console.log('Auth listening on port 3000');
});
