import mongoose from 'mongoose';
import { Password } from '../services/password';

// an interface that describes
// the properties that are required to create a new user

interface UserAttrs {
  email: string;
  password: String;
}

// an interface that describes
// the properties a User model has

interface UserModel extends mongoose.Model<any> {
  build(attrs: UserAttrs): UserDoc;
}
// an interface that describes that
// the User document has

interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret.__id;
        delete ret.__id;
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);

userSchema.pre('save', async function (done) {
  // access to the document we are trying to save, references as this
  // if the user password is modified
  if (this.isModified('password')) {
    const hashed = await Password.toHash(this.get('password'));
    this.set('password', hashed);
  }
  done();
});

userSchema.statics.build = (attrs: UserAttrs): UserDoc => {
  return new User(attrs);
};

// User model
//<> are generic types, generic types can be provided to a function
// similar like a set of arguments
const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

// an user creation
const user = User.build({ email: 'janedoe@jane.com', password: 'holamundo' });

// const newUser = buildUser({ email: 'janedoe@jane.com', password: 'holamundo' });
export { User };
