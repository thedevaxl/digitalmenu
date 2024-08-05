import type { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";
import bcrypt from "bcryptjs";
import User from "./models/user";
import { generateToken, verifyToken } from "../../lib/jwt";
import { sendEmail } from "../../lib/mailgun";
import connectToDatabase from "../../lib/mongodb";
import jwtMiddleware from "../../lib/middleware";
import mongoose from 'mongoose';

const tokenBlacklist = new Set<string>();

const handler = createRouter<NextApiRequest, NextApiResponse>();

const handleRegister = async (req: NextApiRequest, res: NextApiResponse) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    await connectToDatabase();
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
      createdAt: new Date(),
      verificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) // Set expiration for 24 hours
    });

    await newUser.save();

    const token = generateToken({ userId: newUser._id });
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const verificationLink = `${baseUrl}/admin?verify=true&token=${token}`;
    await sendEmail({
      to: newUser.email,
      subject: 'Verify your email address',
      html: `<p>Hello ${newUser.name},</p><p>Please verify your email address by clicking the link below:</p><a href="${verificationLink}">Verify Email</a>`,
    });

    return res.status(201).json({ message: 'User registered', userId: newUser._id, token });
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};


const handleLogin = async (req: NextApiRequest, res: NextApiResponse) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    await connectToDatabase();
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken({ userId: user._id });
    return res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const handleLogout = async (req: NextApiRequest, res: NextApiResponse) => {
  const { authorization: authHeader } = req.headers;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    // Add the token to the blacklist
    tokenBlacklist.add(token);

    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error during logout:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const handleVerify = async (req: NextApiRequest, res: NextApiResponse) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const decoded = verifyToken(token as string);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    await connectToDatabase();
    const user = await User.findById(new mongoose.Types.ObjectId(decoded.userId));

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    user.isVerified = true;
    user.verificationExpires = null; // Remove expiration
    await user.save();

    return res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Error during email verification:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};


const handleResendVerification = async (req: NextApiRequest, res: NextApiResponse) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    await connectToDatabase();
    const currentUser = await User.findById(new mongoose.Types.ObjectId(decoded.userId));
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const newToken = generateToken({ userId: currentUser._id });
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const verificationLink = `${baseUrl}/admin?verify=true&token=${newToken}`;
    await sendEmail({
      to: currentUser.email,
      subject: "Verify your email address",
      html: `<p>Hello ${currentUser.name},</p><p>Please verify your email address by clicking the link below:</p><a href="${verificationLink}">Verify Email</a>`,
    });

    return res.status(200).json({ message: "Verification email sent successfully" });
  } catch (error) {
    console.error("Error resending verification email:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

handler.post(async (req, res) => {
  const { action } = req.query;

  switch (action) {
    case "register":
      await handleRegister(req, res);
      break;
    case "login":
      await handleLogin(req, res);
      break;
    case "logout":
      await handleLogout(req, res);
      break;
    case "verify":
      await handleVerify(req, res);
      break;
    case "resend-verification":
      await handleResendVerification(req, res);
      break;
    default:
      res.status(400).json({ message: "Invalid action" });
      break;
  }
});

handler.use(jwtMiddleware);

handler.get(async (req, res) => {
  const userId = (req as any).user;

  if (!userId) {
    return res.status(404).json({ message: "User not found" });
  }

  try {
    await connectToDatabase();
    const user = await User.findById(new mongoose.Types.ObjectId(userId));
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

export default handler.handler({
  onError: (err, req, res) => {
    console.error(err);
    res.status(500).end((err as Error).toString());
  },
  onNoMatch: (req, res) => {
    res.status(404).end("Page is not found");
  },
});
