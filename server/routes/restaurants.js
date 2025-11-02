const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');
const auth = require('../middleware/auth');

// GET all restaurants
router.get('/', async (req, res) => {
  const list = await Restaurant.find();
  res.json(list);
});

// GET one restaurant by id
router.get('/:id', async (req, res) => {
  const rest = await Restaurant.findById(req.params.id);
  if(!rest) return res.status(404).json({ message: 'Not found' });
  res.json(rest);
});

// Admin-only: create restaurant
router.post('/', auth, async (req, res) => {
  if(!req.user.isAdmin) return res.status(403).json({ message: 'Forbidden' });
  const r = new Restaurant(req.body);
  await r.save();
  res.json(r);
});

module.exports = router;
