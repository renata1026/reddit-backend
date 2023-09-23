import { PrismaClient } from '@prisma/client';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
import { postRouter } from './routes/postRouter.js';
import { subRedditRouter } from './routes/subRedditRouter.js';
import { voteRouter } from './routes/voteRouter.js';
import { userRouter } from './routes/userRouter.js';

const app = express();
export const prisma = new PrismaClient();
app.use(cors());
app.use(express.json());

// Default route
app.get('/', async (req, res) => {
  res.send({ success: true, post: 'Welcome to the Reddit Server' });
});

app.use(async (req, res, next) => {
  // check if there's an auth token in the header and console it
  try {
    // Check if the request has an "Authorization" header
    if (!req.headers.authorization) {
      return next(); // If not, continue to the next middleware
    }

    // Split the "Authorization" header to get the token (assuming it's in the format "Bearer <token>")
    const token = req.headers.authorization.split(' ')[1];

    // Verify the token using a JWT (JSON Web Token) library with a secret key
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);

    // Use the userId from the decoded token to find the corresponding user in the database
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    // If no user is found with the given userId, continue to the next middleware
    if (!user) {
      return next();
    }

    // Remove the "password" property from the user object for security (assuming it's sensitive)
    delete user.password;

    // Attach the user object to the request object for later use in route handlers
    req.user = user;

    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    // Handle any errors that occur during authentication
    res.send({ success: false, error: error.message });
  }
});

app.use('/users', userRouter);
app.use('/posts', postRouter);
app.use('/subreddits', subRedditRouter);
app.use('/votes', voteRouter);

// 404 Route Not Found
app.use((req, res, next) => {
  res.status(404).send({ success: false, error: 'Route does not exist' });
});

// Error Handling Middleware
app.use((error, req, res, next) => {
  res.send({ success: false, error: error.message });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
