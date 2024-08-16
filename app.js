const express = require('express');
const path = require('path');
const routes = require('./routes/index');
const blogRoutes = require('./routes/blog');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();

app.use(express.static('public'));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Set up session management
app.use(session({
  secret: 'your_secret_key', // Replace with your own secret
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set secure: true if you're using HTTPS
}));

// Middleware to make session available in Pug templates
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', routes);
app.use('/blog', blogRoutes);
app.get('/offline.html', (req, res) => {
  res.render('offline');
});
module.exports = app;
