const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const auth = require('./../middleware/auth');

const User = require('./../models/User');

/**
 * @typedef Loggedin
 * @property {string} _id
 * @property {string} name
 * @property {string} email
 * @property {string} date
 * @property {integer} __v
 */

/**
 * Refresh logged in user
 * @route GET /auth
 * @group Users - Operations about user
 * @returns {Loggedin.model} 200 - Users logged in data
 * @security JWT
 */

router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Internal server error');
  }
});

/**
 * @typedef Login
 * @property {string} email.query.required
 * @property {string} password.query.required
 */

/**
 * @typedef JWT
 * @property {string} token
 */

/**
 * Login user
 * @route POST /auth
 * @group Users - Operations about user
 * @param {Login.model} Login.body.required
 * @returns {JWT.model} 200 - token
 */
router.post(
  '/',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });

      if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        process.env.jwtSecret,
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Internal server error');
    }
  }
);

module.exports = router;
