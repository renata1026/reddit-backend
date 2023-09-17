import { PrismaClient } from '@prisma/client';
import express from 'express';
import cors from 'cors';

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

// Default route
app.get('/', async (req, res) => {
  res.send({ success: true, post: 'Welcome to the Reddit Server' });
});

// Get posts route
app.get('/posts', async (req, res) => {
  try {
    console.log('GET /posts route started');

    // Fetch posts from the database
    const posts = await prisma.post.findMany({
      select: {
        id: true,
        text: true,
        title: true,
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        subreddit: {
          select: {
            id: true,
            name: true,
          },
        },
        upvotes: {
          select: {
            id: true,
            userId: true,
          },
        },
        downvotes: {
          select: {
            id: true,
            userId: true,
          },
        },
        childPosts: {
          select: {
            id: true,
            text: true,
          },
        },
      },
    });

    console.log('Retrieved posts:', posts);

    res.send({ success: true, posts });
  } catch (error) {
    // Handle errors in fetching posts
    console.error('Error in GET /posts:', error);
    res.status(500).send({ success: false, error: 'Internal server error' });
  }
});

// Create a new post route
app.post('/posts', async (req, res) => {
  const { title, text, subredditId, userId } = req.body;

  // Validate request body
  if (!title || !text || !userId) {
    return res.send({
      success: false,
      error: 'Title, Text, and User ID are required',
    });
  }

  try {
    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return res.send({ success: false, error: 'Invalid User ID' });
    }

    let post;

    // Create a new post
    if (subredditId) {
      post = await prisma.post.create({
        data: {
          title,
          text,
          subredditId,
          userId,
        },
      });
    } else {
      post = await prisma.post.create({
        data: {
          title,
          text,
          userId,
        },
      });
    }

    res.send({ success: true, post });
  } catch (error) {
    // Handle errors in creating a post
    return res.send({
      success: false,
      error: error.message,
    });
  }
});

// Update a post route
app.put('/posts/:postId', async (req, res) => {
  const { postId } = req.params;
  const { title, text } = req.body;

  // Validate request body
  if (!title && !text) {
    return res.send({
      success: false,
      error: 'Title or Text is required',
    });
  }

  // Check if the post exists
  const postSearch = await prisma.post.findUnique({
    where: {
      id: postId,
    },
  });

  if (!postSearch) {
    return res.send({
      success: false,
      error: 'Post does not exist',
    });
  }

  try {
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

    return res.send({ success: true, post: updatedPost });
  } catch (error) {
    // Handle errors in updating the post
    return res.send({
      success: false,
      error: error.message,
    });
  }
});

// Delete a post route
app.delete('/posts/:postId', async (req, res) => {
  try {
    const { postId } = req.params;

    // Check if the post exists
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) {
      return res.send({
        success: false,
        error: 'Post does not exist',
      });
    }

    // Delete the post
    const deletedPost = await prisma.post.delete({
      where: {
        id: postId,
      },
    });

    return res.send({ success: true, post: deletedPost });
  } catch (error) {
    // Handle errors in deleting the post
    return res.send({
      success: false,
      error: error.message,
    });
  }
});

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
