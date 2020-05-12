'use strict';

const { Router } = require('express');
const router = new Router();
const Post = require('./../models/post');
const User = require('./../models/user');

router.get('/', (req, res, next) => {
  console.log(req.user);
  Post.find()
    .then((post) => {
      console.log(post.user);
      res.render('index', { post });
    })
    .catch((error) => next(error));
});

router.get('/private', (req, res, next) => {
  res.render('private');
});

module.exports = router;
