var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');
var User = mongoose.model('User');
var passport = require('passport');
var jwt = require('express-jwt');

// Authentication JsonWebToken middleware
var auth = jwt({
  secret: 'SECRET', userProperty: 'payload'
});

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

/* Post routes */
router.get('/posts', function (req, res, next) {
  Post.find(function (err, posts) {
    if (err) { next(err); }
    res.json(posts);
  });
});

router.post('/posts', auth, function (req, res, next) {
  var post = new Post(req.body);
  post.author = req.payload.username;
  post.save(function (err, post) {
    if (err) { next(err); }
    res.json(post);
  })
});

router.param('post', function (req, res, next, id) {
  Post.findById(id).exec(function (err, post) {
    if (err) { next(err); }
    else if (!post) { next(new Error("Couldn't find post")); }
    else {
      req.post = post;
      return next();
    }
  });
});

router.param('comment', function (req, res, next, id) {
  Comment.findById(id).exec(function (err, comment) {
    if (err) { next(err); }
    else if (!comment) { next(new Error("Couldn't find comment")); }
    else {
      req.comment = comment;
      return next();
    }
  });
});

router.get('/posts/:post', function (req, res, next) {
  res.json(req.post);
});

router.get('/posts/:post/comments', function (req, res, next) {
  Comment.find({ Post: req.post._id }).exec(function (err, comments) {
    if (err) { next(err); }
    else {
      res.json(comments);
    }
  });
  /*req.post.populate({ path: 'comments' }).exec(function(err, post) {
    if (err) { next(err); }
    res.json(post.comments);
    next();
  });*/
});

router.put('/posts/:post/upvote', auth, function (req, res, next) {
  req.post.upvote(function (err, post) {
    if (err) { return next(err); }
    else if (!post) { return next(new Error("Couldn't find post")); }
    else {
      res.json(post);
    }
  });
});

router.post('/posts/:post/comment', auth, function (req, res, next) {
  var bodyComment = new Comment(req.body);
  bodyComment.Post = req.post._id;
  bodyComment.author = req.payload.username;
  bodyComment.save(function (err, comment) {
    if (err) { return next(err); }
    if (!comment) { return next(new Error("Couldn't save comment")); }
    req.post.comments.push(comment)
    req.post.save(function (err, post) {
      if (err) { return next(err); }
      res.json(comment);
    });
  });
});

router.put('/posts/comment/:comment/upvote', auth, function (req, res, next) {
  req.comment.upvote(function (err, comment) {
    if (err) { next(err); }
    else {
      res.json(comment);
    }
  });
});

// User stuff

router.post('/register', function (req, res, next) {
  if (!req.body.username || !req.body.password) {
    res.status(401).json({ message: 'Invalid username and passport. Bad validation' });
  } else {
    var user = new User();
    user.username = req.body.username;
    user.setPassword(req.body.password);
    user.save(function (err) {
      if (err) { next(err); }
      return res.json({ token: user.generateJWT() });
    });
  }
});

router.post('/login', function (req, res, next) {
  if (!req.body.username || !req.body.password) {
    res.status(400).json({ message: 'Invalid username and passport. Bad validation' });
  } else {
    passport.authenticate('local', function (err, user, info) {
      if (err) { return next(err); }
      if (!user) { return res.status(401).json(info); }
      else {
        return res.json({token: user.generateJWT()});
      }
    })(req, res, next);
  }
});

module.exports = router;
