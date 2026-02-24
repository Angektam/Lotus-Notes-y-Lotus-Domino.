const express = require('express');
const router = express.Router();
const noteController = require('../controllers/note.controller');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/', noteController.createNote);
router.get('/', noteController.getNotes);
router.get('/public', noteController.getPublicNotes);
router.put('/:id', noteController.updateNote);
router.delete('/:id', noteController.deleteNote);

module.exports = router;
