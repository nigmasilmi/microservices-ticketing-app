import { CustomError } from './custom-error';

export class DatabaseConnectionError extends CustomError {
  public reason = 'Error connecting to database';
  statusCode = 500;
  constructor() {
    super('something else');
    Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
  }
  serializeErrors() {
    return [{ message: this.reason }];
  }
}
