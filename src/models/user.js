import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import bcrypt from 'bcryptjs';

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
  },
  roles: {
    type: [String],
  },
});

userSchema.methods.generateHash = function(password) {
  return this.password = bcrypt.hashSync(password, 8);
};

userSchema.methods.compareHash = function (password) {
  return bcrypt.compareSync(password, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;

// create new Admin user if there are no users in the collection
const newAdmin = () => {
  const adminData = { username: 'Admin', roles: ['admin'] };
  const user = new User(adminData);
  user.generateHash('password');
  user.save();
};

User.find()
  .then(users => {
    if (users.length === 0) {
      newAdmin();
    }
  });
