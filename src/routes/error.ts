const express = require('express');
const router = express.Router();

const ErrorController = require('../app/controllers/ErrorController');

router.route('/')
    .get(ErrorController.getAllErrorType)
    .post(ErrorController.createErrorType);

module.exports = router;

export {}