const { Router } = require('express');
const router = new Router();

const Post = require('./../models/post');
const routeGuard = require('./../middleware/route-guard');
const uploader = require('./../middleware/uploader');

//post a new image

router.get('/create', routeGuard, (req, res, next) => {
  console.log('hi');
  res.render('post/create');
});
router.post(
  '/create',
  routeGuard,
  uploader.single('picture'),
  (req, res, next) => {
    const { content, title } = req.body;
    const pictureUrl = req.file.url;
    const userId = req.user._id;
    Post.create({
      content,
      creatorId: userId,
      pictureUrl,
      title,
    })
      .then((result) => {
        console.log(result);
        res.render('index');
      })
      .catch((error) => {
        next(error);
      });
  }
);
module.exports = router;
