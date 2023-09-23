import express from 'express';
import { prisma } from '../index.js';

export const subRedditRouter = express.Router();

subRedditRouter.get('/', async (req, res) => {
  try {
    // Fetch subreddits from the database
    const subreddits = await prisma.subreddit.findMany({
      select: {
        id: true,
        name: true,
        userId: true,
      },
    });

    res.send({ success: true, subreddits });
  } catch (error) {
    // Handle errors in fetching subreddits
    console.error('Error in GET /subreddits:', error);
    res.status(500).send({ success: false, error: 'Internal server error' });
  }
});

subRedditRouter.post('/', async (req, res) => {
  const { name } = req.body;

  // Validate request body
  if (!name) {
    return res.send({
      success: false,
      error: 'Name is required',
    });
  }

  // Ensure you have a valid user ID from your authentication middleware
  const userId = req.user ? req.user.id : null;

  try {
    // Create a new subreddit
    const subreddit = await prisma.subreddit.create({
      data: {
        name,
        userId: userId, // Provide the userId here
      },
    });

    res.send({
      success: true,
      subreddit: {
        id: subreddit.id,
        name: subreddit.name,
        userId: subreddit.userId,
      },
    });
  } catch (error) {
    // Handle errors in creating a subreddit
    return res.send({
      success: false,
      error: error.message,
    });
  }
});

// Delete a subreddit route
subRedditRouter.delete('/:subredditId', async (req, res) => {
  try {
    const { subredditId } = req.params;

    // Check if the subreddit exists
    const subreddit = await prisma.subreddit.findUnique({
      where: {
        id: subredditId,
      },
    });

    if (!subreddit) {
      return res.send({
        success: false,
        error: 'Subreddit does not exist',
      });
    }

    // Delete the subreddit
    const deletedSubreddit = await prisma.subreddit.delete({
      where: {
        id: subredditId,
      },
    });

    return res.send({ success: true, subreddit: deletedSubreddit });
  } catch (error) {
    // Handle errors in deleting the subreddit
    return res.send({
      success: false,
      error: error.message,
    });
  }
});
