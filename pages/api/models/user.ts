import mongoose, { Document, Schema } from 'mongoose';

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  isVerified: boolean;
  createdAt: Date;
}

const userSchema: Schema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, expires: '1d' }, // TTL index set to 1 minute for testing
});

const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
