import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../index.js';

export const userRouter = express.Router();

userRouter.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.send({
        success: false,
        error: 'You must provide a username and password when logging in.',
      });
    }
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });
    if (!user) {
      return res.send({
        success: false,
        error: 'User and/or password is invalid.',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.send({
        success: false,
        error: 'User and/or password is invalid.',
      });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    res.send({
      success: true,
      token,
    });
  } catch (error) {
    return res.send({
      success: false,
      error: error.message,
    });
  }
});

userRouter.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.send({
        success: false,
        error: 'You must provide a username and password when logging in.',
      });
    }
    const checkUser = await prisma.user.findFirst({
      where: {
        username,
      },
    });
    if (checkUser) {
      return res.send({
        success: false,
        error: 'Username already exists, please login.',
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    res.send({
      success: true,
      token,
    });
  } catch (error) {
    return res.send({
      success: false,
      error: error.message,
    });
  }
});

userRouter.get('/token', async (req, res) => {
  try {
    if (!req.headers.authorization) {
      return next();
    }
    const token = req.headers.authorization.split(' ')[1];
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    delete user.password;
    res.send({
      success: true,
      user,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});
