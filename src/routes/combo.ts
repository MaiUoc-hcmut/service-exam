const express = require('express');
const router = express.Router();

const ComboController = require('../app/controllers/ComboController');
const Authorize = require('../app/middleware/authorize');
const CheckingExam = require('../app/middleware/exam');
const CheckingCombo = require('../app/middleware/combo');

const FileUpload = require('../config/firebase/fileUpload');

router.route('/')
    .post(
        Authorize.authorizeTeacher, 
        // FileUpload.uploadComboFiles,
        CheckingCombo.checkCreateCombo,
        // ComboController.uploadThumbnailAndCover,
        ComboController.createComboExam
    );

router.route('/page/:page')
    .get(
        Authorize.checkGetAll,
        Authorize.verifyUser,
        ComboController.getAllCombos
    )

router.route('/:comboId')
    .get(
        Authorize.checkGetAll,
        Authorize.verifyUser,
        CheckingCombo.checkGetDetailCombo,
        ComboController.getCombo
    )
    .post(
        Authorize.verifyStudent,
        CheckingCombo.checkStudentBuyCombo,
        ComboController.studentBuyCombo
    )
    .put(
        Authorize.authorizeTeacher,
        CheckingCombo.checkMofifyCombo,
        ComboController.updateCombo
    )
    .delete(
        Authorize.authorizeTeacher,
        CheckingCombo.checkMofifyCombo,
        ComboController.deleteCombo
    );

router.route('/:comboId/basic')
    .get(
        ComboController.getBasicCombo
    );

router.route('/teacher/:teacherId/page/:page')
    .get(
        Authorize.checkGetAll,
        Authorize.verifyUser,
        CheckingExam.checkGetExamCreatedByTeacher,
        ComboController.getComboCreatedByTeacher
    );

router.route('/student/:studentId/page/:page')
    .get(
        ComboController.getComboThatStudentBought
    );

router.route('/search/page/:page')
    .get(
        Authorize.checkGetAll,
        Authorize.verifyUser,
        ComboController.searchCombo
    );

router.route('/search/teacher/:teacherId/page/:page')
    .get(
        Authorize.checkGetAll,
        Authorize.verifyUser,
        CheckingCombo.checkSearchComboOfTeacher,
        ComboController.searchComboOfTeacher
    );


module.exports = router;

export {}