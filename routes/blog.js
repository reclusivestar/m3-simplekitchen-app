const express = require('express');
const mongoose = require('mongoose');
const { check, validationResult } = require('express-validator');

const router = express.Router();
const Blog = require('../models/Blog');

// Middleware to protect routes
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  } else {
    res.redirect('/login');
  }
}

// List all blog posts
router.get('/', isAuthenticated, (req, res) => {
  Blog.find()
    .then((blogs) => {
      res.render('blog-list', { title: 'Blog', blogs });
    })
    .catch(() => {
      res.send('Sorry! Something went wrong.');
    });
});

// Show form to create a new blog post
router.get('/new', isAuthenticated, (req, res) => {
  res.render('blog-form', { title: 'New Blog Post', signedInUser: req.session.user.username });
});

// Handle new blog post submission
router.post('/new', isAuthenticated, [
  check('title').isLength({ min: 1 }).withMessage('Please enter a title'),
  check('content').isLength({ min: 1 }).withMessage('Please enter content')
], (req, res) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    const blogData = {
      title: req.body.title,
      content: req.body.content,
      author: req.session.user.username
    };
    const blog = new Blog(blogData);
    blog.save()
      .then(() => res.redirect('/blog'))
      .catch((err) => {
        console.log(err);
        res.send('Sorry! Something went wrong.');
      });
  } else {
    res.render('blog-form', {
      title: 'New Blog Post',
      errors: errors.array(),
      data: req.body,
      signedInUser: req.session.user.username
    });
  }
});

// View a single blog post
router.get('/:id', isAuthenticated, (req, res) => {
  Blog.findById(req.params.id)
    .then((blog) => {
      res.render('blog-detail', { title: blog.title, blog });
    })
    .catch(() => {
      res.send('Sorry! Something went wrong.');
    });
});

module.exports = router;
