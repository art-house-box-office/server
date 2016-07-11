import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import bcrypt from 'bcrypt';

const userSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  firstName:{
    type: String,
  },
  lastName: {
    type: String
  }
  email: {
    type: String
  },
  roles: {
    type: [String]
  },
});

userSchema.methods.generateHash = password => this.password = bcrypt.hashSync(password,8);

userSchema.methods.compareHash = password => bcrypt.compareSync(password, this.password);

export default User = mongoose.model ('User, userSchema');
