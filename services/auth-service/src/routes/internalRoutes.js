const express = require('express');
const router = express.Router();
const User = require('../models/User');

// INTERNAL endpoint to update user token balance
// Not exposed through gateway
router.patch('/users/:id/tokens', async (req, res, next) => {
  try {
    const { delta } = req.body;
    const userId = req.params.id;

    if (typeof delta !== 'number') {
      return res.status(400).json({ success: false, message: 'Invalid delta value' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.tokenBalance = (user.tokenBalance || 0) + delta;
    await user.save();

    res.status(200).json({ success: true, tokenBalance: user.tokenBalance });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
