var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');
var User = mongoose.model('User');
var passport = require('passport');
var jwt = require('express-jwt');
var serialization = require('../middlewares/modelSerialization');

// Authentication JsonWebToken middleware
var auth = jwt({
  secret: 'SECRET', userProperty: 'payload'
});

var postSerialization = serialization.posts;

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

/* Post routes */
router.get('/posts', function (req, res, next) {
  Post.find(function (err, posts) {
    if (err) { next(err); }
    res.json(posts);
    return next();
  });
}, postSerialization);

router.post('/posts', auth, function (req, res, next) {
  var post = new Post(req.body);
  post.author = req.payload.username;
  post.save(function (err, post) {
    if (err) { return next(err); }
    res.json(post);
  });
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
  Post.findById(req.post._id).populate({ path: 'comments' }).exec(function (err, post) {
    if (err) { return next(err); }
    else {
      res.json(post.comments);
    }
  });
});

router.put('/posts/:post/upvote', auth, function (req, res, next) {
  Post.findById(req.post._id).populate({ path: 'upvotes' }).exec(function (err, post) {
    if (err) { return next(err); }

    User.findById(req.payload._id, function (err, user) {
      for (var elem in post.upvotes) {
        if ("" + post.upvotes[elem]._id == "" + user._id) {
          return res.json(post);
        }
      }

      post.upvotes.push(user);
      post.save(function (err, post) {
        if (err) { return next(err); }
        else if (!post) { return next(new Error("Couldn't find post")); }
        else {
          res.json(post);
        }
      });
    });
  });
});

router.put('/posts/:post/downvote', auth, function (req, res, next) {
  Post.findById(req.post._id).populate({ path: 'upvotes' }).exec(function (err, post) {
    if (err) {
      return next(err);
    }

    User.findById(req.payload._id, function (err, user) {
      var present = false;
      for (var elem in post.upvotes) {
        if ("" + post.upvotes[elem]._id == "" + user._id) {
          present = true;
          break;
        }
      }

      if (!present) {
        return res.json(post);
      }

      post.upvotes.pull(user);
      post.save(function (err, post) {
        if (err) { return next(err); }
        else if (!post) { return next(new Error("Couldn't find post")); }
        else {
          res.json(post);
        }
      });
    });
  });
});

router.post('/posts/:post/comment', auth, function (req, res, next) {
  var bodyComment = new Comment(req.body);
  bodyComment.Post = req.post._id;
  bodyComment.author = req.payload.username;
  bodyComment.save(function (err, comment) {
    if (err) { return next(err); }
    if (!comment) { return next(new Error("Couldn't save comment")); }
    req.post.comments.push(comment);
    req.post.save(function (err, post) {
      if (err) { return next(err); }
      res.json(comment);
    });
  });
});

router.put('/comments/:comment/upvote', auth, function (req, res, next) {
  Comment.findById(req.comment._id).populate({ path: 'upvotes' }).exec(function (err, comment) {
    
    if (err) { return next(err); }

    User.findById(req.payload._id, function (err, user) {
      for (var elem in comment.upvotes) {
        if ("" + comment.upvotes[elem]._id == "" + user._id) {
          return res.json(comment);
        }
      }

      comment.upvotes.push(user);
      comment.save(function (err, comment) {
        if (err) { return next(err); }
        else if (!comment) { return next(new Error("Couldn't find comment")); }
        else {
          res.json(comment);
        }
      });
    });
  });
});

router.put('/comments/:comment/downvote', auth, function (req, res, next) {
  Comment.findById(req.comment._id).populate({ path: 'upvotes' }).exec(function (err, comment) {
    if (err) {
      return next(err);
    }

    User.findById(req.payload._id, function (err, user) {
      var present = false;
      for (var elem in comment.upvotes) {
        if ("" + comment.upvotes[elem]._id == "" + user._id) {
          present = true;
          break;
        }
      }

      if (!present) {
        return res.json(comment);
      }

      comment.upvotes.pull(user);
      comment.save(function (err, comment) {
        if (err) { return next(err); }
        else if (!comment) { return next(new Error("Couldn't find comment")); }
        else {
          res.json(comment);
        }
      });
    });
  });
});

// User stuff

router.post('/register', function (req, res, next) {
  if (!req.body.username || !req.body.password) {
    res.status(401).json({ missingFields: true });
  } else {
    var user = new User();
    user.username = req.body.username;
    user.setPassword(req.body.password);
    user.save(function (err) {
      if (err) { return res.status(401).json({ usernameTaken: true }); }
      return res.json({ token: user.generateJWT() });
    });
  }
});

router.post('/login', function (req, res, next) {
  if (!req.body.username || !req.body.password) {
    res.status(400).json({ missingFields: true });
  } else {
    passport.authenticate('local', function (err, user, info) {
      if (err) { return next(err); }
      if (!user) { return res.status(401).json(info); }
      else {
        return res.json({ token: user.generateJWT() });
      }
    })(req, res, next);
  }
});

router.post('/available', function (req, res, next) {
  if (!req.body.username) {
    res.status(400).json({ missingFields: true });
  } else {
    User.find({ username: req.body.username.toLowerCase() }, function (err, result) {
      if (result.length > 0) {
        return res.json({ taken: true });
      } else {
        return res.json({ taken: false });
      }
    });
  }
});

module.exports = router;