const express = require('express');
const router = express.Router();

const ExamController = require('../app/controllers/examController');
const Authorize = require('../app/middleware/authorize');
const CheckingExam = require('../app/middleware/exam');

router.route('/')
    .post(Authorize.authorizeTeacher, ExamController.createExam);

router.route('/page/:page')
    .get(
        Authorize.checkGetAll, 
        Authorize.verifyUser, 
        ExamController.getAllExams
    );

router.route('/:examId')
    .get(ExamController.getExamById)
    .put(
        Authorize.authorizeTeacher, 
        CheckingExam.checkModifyExam, 
        ExamController.updateExam
    )
    .delete(
        Authorize.authorizeTeacher, 
        CheckingExam.checkModifyExam, 
        ExamController.deleteExam
    );

router.route('/search/page/:page')
    .get(
        Authorize.checkGetAll, 
        Authorize.verifyUser, 
        ExamController.searchExam
    );

router.route('/full/:examId')
    .get(ExamController.getDetailExam);

router.route('/teacher/:teacherId/page/:page')
    .get(
        Authorize.checkGetAll, 
        Authorize.verifyUser, 
        CheckingExam.checkGetExamCreatedByTeacher, 
        ExamController.getExamCreatedByTeacher
    );

module.exports = router;
export {}