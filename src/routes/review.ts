const express = require('express');
const router = express.Router();
const reviewController = require("../app/controllers/ReviewController");
const Authorize = require('../app/middleware/authorize');
const FileUpload = require('../config/firebase/fileUpload');
const CheckingReview = require('../app/middleware/review');

router.route('/')
    .get(reviewController.getAllReviews)
    .post(
        Authorize.verifyStudent, 
        CheckingReview.checkCreateReview, 
        FileUpload.uploadImage,
        reviewController.uploadReviewImage,
        reviewController.createReview
    );

router.route('/:reviewId')
    .get(reviewController.getReviewById)
    .delete(
        Authorize.verifyUser,
        CheckingReview.checkDeleteReview,
        reviewController.deleteReview
    );

router.route('/student/:studentId/page/:page')
    .get(reviewController.getReviewsBelongToStudent);

router.route('/exam/:examId/page/:page')
    .get(reviewController.getReviewsForExam);

router.route('/teacher/:teacherId')
    .get(reviewController.getAllReviewsOfAllExamsOfTeacher);

module.exports = router;

export {}