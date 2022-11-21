const express = require('express');
const postsRouter = express.Router();

const { getAllPosts, createPost, updatePost, getPostById } = require('../db');
const tagsRouter = require('./tags');
const { requireUser } = require('./utils');

postsRouter.post('/', requireUser, async (req, res, next) => {
    
    const { title, content, tags = "" } = req.body;
    
    const data = req.user
    const authorId = data.id

    const tagArr = tags.trim().split(/\s+/)
    const postData = { authorId, title, content };
    console.log('this is POST DATAAAAAA', postData)

    if (tagArr.length) {
        postData.tags = tagArr;
    }

    try {
        const post = await createPost(postData);

        if (post) {
            res.send({ post });
        } else {
            next({ 
                name: "CreatePostsError",
                message: "Error Message Here"
            });
        }

    } catch ({ name, message }) {
        next({ name, message });
    }
});

postsRouter.patch('/:postId', requireUser, async (req, res, next) => {
    const { postId } = req.params;
    const { title, content, tags } = req.body;

    const updateFields = {};

    if (tags && tags.length > 0) {
        updateFields.tags = tags.trim().split(/\s+/);
    }

    if (title) {
        updateFields.title = title;
    }

    if (content) {
        updateFields.content = content;
    }

    try {
        const originalPost = await getPostById(postId);

        if (originalPost.author.id === req.user.id) {
            const updatedPost = await updatePost(postId, updateFields);
            res.send({ post: updatedPost })
        } else {
            next({
                name: 'UnathorizedUserError',
                message: 'You cannot update a post that is not yours'
            })
        }
    } catch ({ name, message }) {
        next({ name, message });
    }
});

postsRouter.delete('/:postId', requireUser, async (req, res, next) => {
    try {
        const post = await getPostById(req.params.postId);

        if (post && post.author.id === req.user.id) {
            const updatedPost = await updatePost(post.id, { active: false });

            res.send({ post: updatedPost });
        } else {
            next(post ? {
                name: "UnauthorizedUserError",
                message: "You cannot delete a post which is not yours!"
            } : {
                name: "PostNotFoundError",
                message: "That post does not exist"
            });
        }
    } catch ({ name, message }) {
        next ({ name, message })
    }
});

// postsRouter.use((req, res, next) => {
//   console.log("A request is being made to /posts");

//   res.send({ message: 'hello from /posts!' });
//     next();
// });


postsRouter.get('/', async (req, res) => {
    try {
        const allPosts = await getAllPosts();
        
        const posts = allPosts.filter(post => {
            return post.active || (req.user && post.author.id === req.user.id);
          });
        
        res.send({
        posts
    });
    } catch ({ name, message }) {
        next({ name, message });
    }
});

module.exports = postsRouter;
