const express = require('express');
const tagsRouter = express.Router();

const { getAllTags, getPostsByTagName } = require('../db');

tagsRouter.use((req, res, next) => {
  console.log("A request is being made to /tags");

//   res.send({ message: 'hello from /tags!' });
    next();
});

tagsRouter.get('/:tagName/posts', async (req, res, next) => {
    const { tagName } = req.params;
    const fields = req.body;

    console.log('tagName:', tagName)
    console.log('fields', fields)
    try {
        const tagPosts = await getPostsByTagName(tagName);
        const posts = tagPosts.filter(post => {
            return post.active || (req.user && post.author.id === req.user.id);
          }); 
        console.log('HERE ARE SOME TAGGED POSTSSSS', posts)
        res.send({ posts: posts });
    } catch ({ name, message }) {
        next({ name, message });
    }
});

tagsRouter.get('/', async (req, res) => {
    const tags = await getAllTags();
    
    res.send({
        tags
    });
});

module.exports = tagsRouter;
