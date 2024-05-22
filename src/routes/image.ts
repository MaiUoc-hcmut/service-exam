const express = require('express');
const router = express.Router();

const ImageController = require('../app/controllers/ImageController');
const FileUpload = require('../config/firebase/fileUpload');

router.route('/')
    .post(FileUpload.uploadImage, ImageController.uploadSingleImage);

module.exports = router;
export {}