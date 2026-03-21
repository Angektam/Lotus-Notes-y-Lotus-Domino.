const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const galleryController = require('../controllers/gallery.controller');

router.use(authMiddleware);

router.get('/', galleryController.getImages);
router.post('/', upload.single('image'), galleryController.uploadImage);
router.delete('/:filename', galleryController.deleteImage);

module.exports = router;
