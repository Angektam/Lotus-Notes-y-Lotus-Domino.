const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/', messageController.sendMessage);
router.get('/inbox', messageController.getInbox);
router.get('/sent', messageController.getSentMessages);
router.put('/:id/read', messageController.markAsRead);

module.exports = router;
