const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const auth = require('http-auth');
const bcrypt = require('bcrypt')
const { check, validationResult } = require('express-validator');

const router = express.Router();
const Registration = mongoose.model('Registration');
const basic = auth.basic({
  file: path.join(__dirname, '../users.htpasswd'),
});

router.get('/', (req, res) => {
  res.render('index', { title: 'Home' });
});

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

router.get('/thankyou', (req, res) => {
  res.render('thankyou', { title: 'Thank You' });
});

router.get('/registrants', basic.check((req, res) => {
  Registration.find()
    .then((registrations) => {
      res.render('registrants', { title: 'Listing registrations', registrations });
    })
    .catch(() => { 
      res.send('Sorry! Something went wrong.'); 
    });
}));

module.exports = router;
