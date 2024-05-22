const express = require('express');
const router = express.Router();

const ReportController = require('../app/controllers/ReportController');
const Authorize = require('../app/middleware/authorize');
const CheckingReport = require('../app/middleware/report');

router.route('/:questionId')
    .get(ReportController.getReportOfQuestion)
    .post(Authorize.verifyStudent, CheckingReport.checkReportQuestion, ReportController.studentReportErrorOfQuestion);

module.exports = router;

export {}