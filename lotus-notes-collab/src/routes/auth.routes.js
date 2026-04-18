const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', authMiddleware, authController.getProfile);
router.get('/users/search', authMiddleware, authController.searchUsers);

router.get('/online-users', authMiddleware, (req, res) => {
  const { getOnlineUsers } = require('../config/socket');
  res.json({ success: true, data: getOnlineUsers() });
});

module.exports = router;
