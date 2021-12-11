import { ValidationError } from 'express-validator';
import { CustomError } from './custom-error';

// forma general de los errores
// {
//   errors:{
//     message: string, field?:string
//   }[]
// }

export class RequestValidationError extends CustomError {
  statusCode = 500;
  constructor(public errors: ValidationError[]) {
    super('something');

    // Porque estamos heredando de una clase built in
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }
  serializeErrors() {
    return this.errors.map((err) => {
      return { message: err.msg, field: err.param };
    });
  }
}
