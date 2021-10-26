const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require('bcryptjs');

const User = require('./../models/User');

/**
 * @typedef User
 * @property {string} name.query.required
 * @property {string} email.query.required
 * @property {string} password.query.required
 */

/**
 * @typedef JWT
 * @property {string} token
 */

/**
 * Register a user
 * @route POST /users
 * @group Users - Operations about user
 * @param {User.model} User.body.required
 * @returns {JWT.model} 200 - token
 */
router.post(
  '/',
  [
    check('name', 'Please add a name').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) return res.status(400).json({ msg: 'User already exists' });

      user = new User({
        name,
        email,
        password,
      });

      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();

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
