import express from 'express';
import { prisma } from '../index.js';

export const voteRouter = express.Router();

// Upvote a post by postId
voteRouter.post('/upvotes/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const existingUpvote = await prisma.upvote.findUnique({
      where: {
        userId_postId: {
          userId: req.user.id,
          postId,
        },
      },
    });

    const newUpvote = await prisma.upvote.create({
      data: { postId, userId: req.user.id },
    });

    res.json({ success: true, upvote: newUpvote });
  } catch (error) {
    // Handle errors
    console.error('Error in POST /upvotes/:postId:', error);
    res.json({
      success: false,
      error: error.message,
    });
  }
});

// Downvote a post by postId
voteRouter.post('/downvotes/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const existingDownvote = await prisma.downvote.findUnique({
      where: {
        userId_postId: {
          userId: req.user.id,
          postId,
        },
      },
    });

    const newDownvote = await prisma.downvote.create({
      data: { postId, userId: req.user.id },
    });

    res.json({ success: true, downvote: newDownvote });
  } catch (error) {
    // Handle errors
    console.error('Error in POST /downvotes/:postId:', error);
    res.json({
      success: false,
      error: error.message,
    });
  }
});

// Remove an upvote by postId
voteRouter.delete('/upvotes/:postId', async (req, res) => {
  try {
    const { postId } = req.params;

    const existingUpvote = await prisma.upvote.findUnique({
      where: {
        userId_postId: {
          userId: req.user.id,
          postId,
        },
      },
    });

    if (existingUpvote) {
      const deletedUpvote = await prisma.upvote.delete({
        where: {
          id: existingUpvote.id,
        },
      });

      res.json({ success: true, upvote: deletedUpvote });
    } else {
      res.json({ success: false, message: 'Upvote does not exist' });
    }
  } catch (error) {
    // Handle errors
    console.error('Error in DELETE /upvotes/:postId:', error);
    res.json({
      success: false,
      error: error.message,
    });
  }
});

// Remove a downvote by postId
voteRouter.delete('/downvotes/:postId', async (req, res) => {
  try {
    const { postId } = req.params;

    const existingDownvote = await prisma.downvote.findUnique({
      where: {
        userId_postId: {
          userId: req.user.id,
          postId,
        },
      },
    });

    if (existingDownvote) {
      const deletedDownvote = await prisma.downvote.delete({
        where: {
          id: existingDownvote.id,
        },
      });

      res.json({ success: true, downvote: deletedDownvote });
    } else {
      res.json({ success: false, message: 'Downvote does not exist' });
    }
  } catch (error) {
    // Handle errors
    console.error('Error in DELETE /downvotes/:postId:', error);
    res.json({
      success: false,
      error: error.message,
    });
  }
});
