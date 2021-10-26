const express = require('express');
const router = express.Router();
const auth = require('./../middleware/auth');
const { check, validationResult } = require('express-validator');

const User = require('./../models/User');
const Contact = require('./../models/Contact');

/**
 * @typedef Contact
 * @property {string} _id
 * @property {string} name
 * @property {string} email
 * @property {string} date
 * @property {string} phone
 * @property {string} type
 * @property {string} user
 * @property {integer} __v
 */

/**
 * Get all users contacts
 * @route GET /contacts
 * @group Contacts - CRUD
 * @returns {Array.<Contact>} 200 - All users contacts
 * @security JWT
 */

router.get('/', auth, async (req, res) => {
  try {
    const contacts = await Contact.find({ user: req.user.id }).sort({
      date: -1,
    });
    res.json(contacts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Internal server error');
  }
});

/**
 * @typedef NewContact
 * @property {string} name.query.required
 * @property {string} email.query.required
 * @property {string} phone.query.required
 * @property {string} type.query.required
 */

/**
 * Add new contact
 * @route POST /contacts
 * @group Contacts - CRUD
 * @param {NewContact.model} NewContact.body.required
 * @returns {Contact.model} 200 - New contact
 * @security JWT
 */

router.post(
  '/',
  [auth, [check('name', 'Name is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, type } = req.body;

    try {
      const newContact = new Contact({
        name,
        email,
        phone,
        type,
        user: req.user.id,
      });

      const contact = await newContact.save();

      res.json(contact);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Internal server error');
    }
  }
);

/**
 * Update contact
 * @route PUT /contacts/{id}
 * @group Contacts - CRUD
 * @param {string} id.path.required - contact id
 * @param {Contact.model} Contact.body.required
 * @returns {Contact.model} 200 - Updated contact
 * @security JWT
 */

router.put('/:id', auth, async (req, res) => {
  const { name, email, phone, type } = req.body;

  const contactFields = {};

  if (name) contactFields.name = name;
  if (email) contactFields.email = email;
  if (phone) contactFields.phone = phone;
  if (type) contactFields.type = type;

  try {
    let contact = await Contact.findById(req.params.id);

    if (!contact) return res.status(404).json({ msg: 'Contact not found' });

    if (contact.user.toString() !== req.user.id)
      return res.status(401).json({ msg: 'Not authorized' });

    contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { $set: contactFields },
      { new: true }
    );

    res.json(contact);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Internal server error');
  }
});

/**
 * @typedef Delete
 * @property {string} msg
 */

/**
 * Delete contact
 * @route DELETE /contacts/{id}
 * @group Contacts - CRUD
 * @param {string} id.path.required - contact id
 * @returns {Delete.model} 200 - Removed contact
 * @security JWT
 */

router.delete('/:id', auth, async (req, res) => {
  try {
    let contact = await Contact.findById(req.params.id);

    if (!contact) return res.status(404).json({ msg: 'Contact not found' });

    if (contact.user.toString() !== req.user.id)
      return res.status(401).json({ msg: 'Not authorized' });

    await Contact.findByIdAndRemove(req.params.id);

    res.json({ msg: 'Contact removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Internal server error');
  }
});

module.exports = router;
