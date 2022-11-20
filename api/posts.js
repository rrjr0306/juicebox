const express = require('express');
const postsRouter = express.Router();

const { getAllPosts, createPost } = require('../db');
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



// postsRouter.use((req, res, next) => {
//   console.log("A request is being made to /posts");

//   res.send({ message: 'hello from /posts!' });
//     next();
// });


postsRouter.get('/', async (req, res) => {
    const posts = await getAllPosts();
    
    res.send({
        posts
    });
});

module.exports = postsRouter;
