import express from 'express';
import { prisma } from '../index.js';

export const postRouter = express.Router();

// Recursive function to fetch all posts with children and related data
async function getAllPostsWithChildren() {
  const posts = await prisma.post.findMany({
    include: {
      children: {
        include: {
          children: true, // Include grandchildren
        },
      },
      user: true, // Include the user who authored the post
      subreddit: true, // Include the subreddit to which the post belongs
      upvotes: true, // Include upvotes for the post
      downvotes: true, // Include downvotes for the post
    },
  });

  return posts;
}

// Create a new post route
postRouter.post('/', async (req, res) => {
  try {
    // Ensure you have a valid user ID from your authentication middleware
    const userId = req.user ? req.user.id : null;

    const { title, text, subredditId } = req.body;

    // Validate request body
    if (!title || !text || !subredditId) {
      return res.json({
        success: false,
        error: 'Title, Text, and subredditId are required',
      });
    }

    // Create a new post
    const post = await prisma.post.create({
      data: {
        title,
        text,
        subredditId,
        userId,
      },
    });

    res.json({ success: true, post });
  } catch (error) {
    console.error('Error in POST /posts:', error);
    res.json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Get posts route with nested children and grandchildren
postRouter.get('/', async (req, res) => {
  try {
    // Fetch all posts with children and grandchildren
    const postsWithChildren = await getAllPostsWithChildren();

    res.json({ success: true, posts: postsWithChildren });
  } catch (error) {
    console.error('Error in GET /posts:', error);
    res.json({ success: false, error: 'Internal server error' });
  }
});

// Update a post route
postRouter.put('/:postId', async (req, res) => {
  const { postId } = req.params;
  const { title, text } = req.body;

  // Validate request body
  if (!title && !text) {
    return res.json({
      success: false,
      error: 'Title or Text is required',
    });
  }

  try {
    // Check if the post exists
    const postSearch = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!postSearch) {
      return res.json({
        success: false,
        error: 'Post not found',
      });
    }

    // Update the post
    const updatedPost = await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        title,
        text,
      },
    });

    res.json({ success: true, post: updatedPost });
  } catch (error) {
    console.error('Error in PUT /posts/:postId:', error);
    res.json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Delete a post route
postRouter.delete('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;

    // Check if the post exists
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) {
      return res.json({
        success: false,
        error: 'Post not found',
      });
    }

    // Delete the post
    await prisma.post.delete({
      where: {
        id: postId,
      },
    });

    res.json({
      success: true,
      post: {
        id: post.id,
        text: post.text,
        title: post.title,
        userId: post.userId,
        subredditId: post.subredditId,
        parentId: post.parentId,
      },
    });
  } catch (error) {
    console.error('Error in DELETE /posts/:postId:', error);
    res.json({
      success: false,
      error: error.message,
    });
  }
});
