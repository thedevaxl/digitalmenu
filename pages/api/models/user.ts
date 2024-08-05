import mongoose, { Document, Schema } from 'mongoose';

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  isVerified: boolean;
  createdAt: Date;
  verificationExpires: Date | null;
}

const userSchema: Schema<IUser> = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  verificationExpires: { type: Date, default: () => Date.now() + 24 * 60 * 60 * 1000, expires: 0 }, // TTL index for 1 day
});

userSchema.pre('save', function (next) {
  if (this.isVerified) {
    this.verificationExpires = null; // Remove expiration if user is verified
  }
  next();
});

const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
