// test/app.test.js
const mongoose = require('mongoose');
const Registration = require('../models/Registration'); // Import the model for use in tests

const request = require('supertest');
const app = require('../app'); // Make sure to point to your Express app

describe('Express App', () => {
  it('should return the home page with status 200', (done) => {
    request(app)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(200, done);
  });

  it('should return the login page with status 200', (done) => {
    request(app)
      .get('/login')
      .expect('Content-Type', /html/)
      .expect(200, done);
  });
});
