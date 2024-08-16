const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const Registration = mongoose.model('Registration');

// Home route
router.get('/', (req, res) => {
  res.render('index', { title: 'Home' });
});

// Registration route
router.get('/register', (req, res) => {
  res.render('register', { title: 'Register' });
});

router.post('/register', 
  [
    check('name')
      .isLength({ min: 1 })
      .withMessage('Please enter a name'),
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email'),
    check('username')
      .isLength({ min: 1 })
      .withMessage('Please enter a username'),
    check('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      const registration = new Registration(req.body);
      const salt = await bcrypt.genSalt(10);
      registration.password = await bcrypt.hash(registration.password, salt);
      registration.save()
        .then(() => { res.redirect('/thankyou'); })
        .catch((err) => {
          console.log(err);
          res.send('Sorry! Something went wrong.');
        });
    } else {
      res.render('register', { 
        title: 'Register',
        errors: errors.array(),
        data: req.body,
      });
    }
  });

// Thank you route
router.get('/thankyou', (req, res) => {
  res.render('thankyou', { title: 'Thank You' });
});

// Login route
router.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

router.post('/login', async (req, res) => {
  try {
    const user = await Registration.findOne({ username: req.body.username });
    if (user) {
      const match = await bcrypt.compare(req.body.password, user.password);
      if (match) {
        req.session.user = user;
        return res.redirect('/blog');
      }
    }
    res.status(400).render('login', { errors: [{ msg: 'Invalid username or password' }] });
  } catch (error) {
    res.status(500).send('Something went wrong.');
  }
});

// List registrants route
router.get('/registrants', async (req, res) => {
  if (req.session.user) {
    try {
      const registrations = await Registration.find();
      res.render('registrants', { title: 'Listing registrations', registrations });
    } catch {
      res.send('Sorry! Something went wrong.');
    }
  } else {
    res.redirect('/login');
  }
});

// Log Out route
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect('/blog');
    }
    res.redirect('/');
  });
});


module.exports = router;
