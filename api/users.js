const express = require('express');
const usersRouter = express.Router();
const jwt = require('jsonwebtoken');

const { getAllUsers, getUserById, getUserByUsername, createUser, updateUser } = require('../db');

const { requireUser } = require('./utils');

usersRouter.use((req, res, next) => {
    console.log("A request is being made to /users");
  
    // res.send({ message: 'hello from /users!' });
    next();
  });
  
usersRouter.delete('/:userId', requireUser, async (req, res, next) => {
  // const { username } = req.body;
  // const fields = req.body;
  // console.log('WHAT IS LOVE?', username)
  const _user = await getUserById(req.params.userId);
  console.log('reqparamsid!!', req.params.userId)
  console.log('REQUSERID', req.user)
  try {
    // const _user = await getUserById(req.params.userId);
        // const user = await getUserByUsername(username);
        console.log("------here------", _user)
        console.log('REQUSERID', req.user)
        if ( _user && _user.id === req.user.id) {
          console.log('DO YOU GET HERE?????')  
          const updatedUser = await updateUser(_user.id, { active: false });

            res.send({ _user: updatedUser });
        } else {
            next(_user ? {
                name: "UnauthorizedUserError",
                message: "You cannot delete another user!"
            } : {
                name: "UserNotFoundError",
                message: "That user does not exist"
            });
        }
    } catch ({ name, message }) {
        next ({ name, message })
    }
});

usersRouter.post('/login', async (req, res, next) => {
    console.log('REQBODY', req.body)
    const { username, password } = req.body;
    // console.log(req.body);
    // res.end();
  
    // request must have both
    if (!username || !password) {
      next({
        name: "MissingCredentialsError",
        message: "Please supply both a username and password"
      });
    }
  
    try {
      const user = await getUserByUsername(username);
  
      if (user && user.password == password) {
        const token = jwt.sign({ 
            id: user.id, 
            username
          }, process.env.JWT_SECRET, {
            expiresIn: '1w'
          });
        res.send({ 
            message: "you're logged in!",
            token 
        });
      } else {
        next({ 
          name: 'IncorrectCredentialsError', 
          message: 'Username or password is incorrect'
        });
      }
    } catch({ name, message }) {
      next({ name, message });
    }
  });


usersRouter.post('/register', async (req, res, next) => {
    const { username, password, name, location } = req.body;
  
    try {
      const _user = await getUserByUsername(username);
  
      if (_user) {
        next({
          name: 'UserExistsError',
          message: 'A user by that username already exists'
        });
      }
  
      const user = await createUser({
        username,
        password,
        name,
        location,
      });
  
      const token = jwt.sign({ 
        id: user.id, 
        username
      }, process.env.JWT_SECRET, {
        expiresIn: '1w'
      });
  
      res.send({ 
        message: "thank you for signing up",
        token 
      });
    } catch ({ name, message }) {
      next({ name, message })
    } 
  });

  

usersRouter.get('/', async (req, res) => {
    const users = await getAllUsers();
  
    res.send({
      users
    });
  });



module.exports = usersRouter;
