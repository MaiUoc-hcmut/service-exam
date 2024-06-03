const Review = require('../../db/model/review');
const Exam = require('../../db/model/exam');
const Combo = require('../../db/model/combo');

const axios = require('axios');
require('dotenv').config();
import { Request, Response, NextFunction } from 'express';

const { sequelize } = require('../../config/db/index');
const { Op } = require('sequelize');

const fileUpload = require('../../config/firebase/fileUpload');
const { firebaseConfig } = require('../../config/firebase/firebase');
const {
    ref,
    getDownloadURL,
    uploadBytesResumable,
    getStorage,
} = require('firebase/storage');
const { initializeApp } = require('firebase/app');

initializeApp(firebaseConfig);
const storage = getStorage();

declare global {
    namespace Express {
        interface Request {
            ImageUrl: string;
            user?: USER
        }
    
    }
}

class ReviewController {

    // [GET] /reviews
    getAllReviews = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const { type } = req.query;

            const queryOption: any = {}

            if (type === "exam") {
                queryOption.where = {
                    id_combo: null
                }
            } else if (type === "combo") {
                queryOption.where = {
                    id_exam: null
                }
            }
            const reviews = await Review.findAll(queryOption);

            for (const review of reviews) {
                try {
                    const student = await axios.get(`${process.env.BASE_URL_USER_LOCAL}/student/${review.id_student}`);
                    review.dataValues.student = {
                        id: student.id,
                        name: student.name,
                        email: student.email,
                        avatar: student.avatar
                    }
                } catch (error) {
                    review.dataValues.student = {
                        id: review.id_student,
                        name: "Error",
                        email: "Error",
                        avatar: "Error"
                    }
                }
                if (type === "exam") {
                    const exam = await Exam.findByPk(review.id_exam);
                    review.dataValues.exam = {
                        id: exam.id,
                        name: exam.title
                    }
                    delete review.dataValues.id_exam;
                }

                if (type === "combo") {
                    const combo = await Combo.findByPk(review.id_combo);
                    review.dataValues.combo = {
                        id: combo.id,
                        name: combo.title
                    }
                    delete review.dataValues.id_combo;
                }
                delete review.dataValues.id_student;
            }

            res.status(200).json(reviews);
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ error });
        }
    }

    // [GET] /reviews/exam/:examId/page/:page
    getReviewsForExam = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const id_exam = req.params.examId;
            const exam = await Exam.findByPk(id_exam);

            const currentPage: number = +req.params.page;
            const pageSize: number = parseInt(process.env.SIZE_OF_PAGE || '10');

            let preDate: Date = new Date(0);
            let postDate: Date = new Date();

            if (typeof req.query.postDate === 'string') {
                const date1 = new Date(req.query.postDate);
                if (!Number.isNaN(date1.getTime())) {
                    postDate = date1;
                }
            } else if (req.query.postDate instanceof Date) {
                postDate = req.query.postDate;
            }

            if (typeof req.query.preDate === 'string') {
                const date2 = new Date(req.query.preDate);
                if (!Number.isNaN(date2.getTime())) {
                    postDate = date2;
                }
            } else if (req.query.preDate instanceof Date) {
                preDate = req.query.preDate;
            }

            const date_condition: any = {
                [Op.between]: [preDate, postDate]
            }

            let rating = req.query.rating;
            let rating_condition: number[] = [];
            if (typeof rating === "string" && !Number.isNaN(parseInt(rating))) {
                rating_condition.push(parseInt(rating));
            } else if (Array.isArray(rating)) {
                for (const r of rating) {
                    if (typeof r === "string" && !Number.isNaN(parseInt(r))) {
                        rating_condition.push(parseInt(r));
                    }
                }
            }
            if (rating_condition.length === 0) {
                rating_condition = [1, 2, 3, 4, 5]
            }

            const count = await Review.findAll({
                where: { id_exam, createdAt: date_condition, rating: rating_condition }
            });

            const reviews = await Review.findAll({
                where: { id_exam, createdAt: date_condition, rating: rating_condition },
                limit: pageSize,
                offset: pageSize * (currentPage - 1)
            });

            let totalRating = 0;
            let starCount: { [key: number]: number } = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};

            for (const review of reviews) {
                totalRating += review.rating;
                starCount[review.rating]++;
                
                const user = await axios.get(`${process.env.BASE_URL_USER_LOCAL}/student/${review.id_student}`);

                review.dataValues.user = { avatar: user.data.avatar, name: user.data.name };
                review.dataValues.exam = exam.title;
            }

            let starDetails: { [key: string]: { quantity: number, percentage: number } } = {};

            for (let i = 1; i <= 5; i++) {
                starDetails[`${i}star`] = {
                    quantity: starCount[i],
                    percentage: (starCount[i] / reviews.length) * 100
                };
            }

            let response = {
                count: count.length,
                reviews,
                averageRating: totalRating / reviews.length,
                starDetails
            }

            res.status(200).json(response);
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ error });
        }
    }

    // [GET] /reviews/combo/:comboId/page/:page
    getReviewsForCombo = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const id_combo = req.params.comboId;
            const combo = await Combo.findByPk(id_combo);

            const currentPage: number = +req.params.page;
            const pageSize: number = parseInt(process.env.SIZE_OF_PAGE || '10');

            let preDate: Date = new Date(0);
            let postDate: Date = new Date();

            if (typeof req.query.postDate === 'string') {
                const date1 = new Date(req.query.postDate);
                if (!Number.isNaN(date1.getTime())) {
                    postDate = date1;
                }
            } else if (req.query.postDate instanceof Date) {
                postDate = req.query.postDate;
            }

            if (typeof req.query.preDate === 'string') {
                const date2 = new Date(req.query.preDate);
                if (!Number.isNaN(date2.getTime())) {
                    postDate = date2;
                }
            } else if (req.query.preDate instanceof Date) {
                preDate = req.query.preDate;
            }

            const date_condition: any = {
                [Op.between]: [preDate, postDate]
            }

            let rating = req.query.rating;
            let rating_condition: number[] = [];
            if (typeof rating === "string" && !Number.isNaN(parseInt(rating))) {
                rating_condition.push(parseInt(rating));
            } else if (Array.isArray(rating)) {
                for (const r of rating) {
                    if (typeof r === "string" && !Number.isNaN(parseInt(r))) {
                        rating_condition.push(parseInt(r));
                    }
                }
            }
            if (rating_condition.length === 0) {
                rating_condition = [1, 2, 3, 4, 5]
            }

            const count = await Review.count({
                where: { id_combo, createdAt: date_condition, rating: rating_condition }
            });

            const reviews = await Review.findAll({
                where: { id_combo, createdAt: date_condition, rating: rating_condition },
                limit: pageSize,
                offset: pageSize * (currentPage - 1)
            });

            let totalRating = 0;
            let starCount: { [key: number]: number } = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};

            for (const review of reviews) {
                totalRating += review.rating;
                starCount[review.rating]++;
                
                const user = await axios.get(`${process.env.BASE_URL_USER_LOCAL}/student/${review.id_student}`);

                review.dataValues.user = { avatar: user.data.avatar, name: user.data.name };
                review.dataValues.combo = combo.name;
            }

            let starDetails: { [key: string]: { quantity: number, percentage: number } } = {};

            for (let i = 1; i <= 5; i++) {
                starDetails[`${i}star`] = {
                    quantity: starCount[i],
                    percentage: (starCount[i] / reviews.length) * 100
                };
            }

            let response = {
                count,
                reviews,
                averageRating: totalRating / reviews.length,
                starDetails
            }

            res.status(200).json(response);
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ error });
        }
    }

    // [GET] /reviews/teacher/:teacherId
    getAllReviewsOfAllExamsOfTeacher = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const id_teacher = req.params.teacherId;

            const reviewsList: any[] = [];

            const exams = await Exam.findAll({
                where: {
                    id_teacher,
                    id_course: null
                }
            });

            for (const exam of exams) {
                const reviews = await Review.findAll({
                    where: {
                        id_exam: exam.id
                    }
                });

                for (const review of reviews) {
                    review.dataValues.exam_name = exam.title;

                    const student = await axios.get(`${process.env.BASE_URL_USER_LOCAL}/student/${review.id_student}`);
                    review.dataValues.user = {
                        id: student.data.id,
                        name: student.data.name,
                        avatar: student.data.avatar
                    }
                }
                reviewsList.push(...reviews);
            }

            res.status(200).json(reviewsList);
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ error });
        }
    }

    // [GET] /reviews/combo/teacher/:teacherId
    getAllReviewsOfAllCombosOfTeacher = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const id_teacher = req.params.teacherId;

            const reviewList: any[] = [];

            const combos = await Combo.findAll({
                where: {
                    id_teacher
                }
            });

            for (const combo of combos) {
                const reviews = await Review.findAll({
                    where: {
                        id_combo: combo.id
                    }
                });

                for (const review of reviews) {
                    review.dataValues.combo_name = combo.name;

                    const student = await axios.get(`${process.env.BASE_URL_USER_LOCAL}/student/${review.id_student}`);
                    review.dataValues.user = {
                        id: student.data.id,
                        name: student.data.name,
                        email: student.data.email,
                        avatar: student.data.avatar
                    }
                }

                reviewList.push(...reviews);
            }

            res.status(200).json(reviewList);
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ error });
        }
    }

    // [GET] /reviews/:reviewId
    getReviewById = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const review = await Review.findByPk(req.params.reviewId);

            if (!review) return res.status(404).json({ message: "Review does not exist" });

            res.status(200).json(review);
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ error });
        }
    }

    // [GET] /reviews/student/:studentId/page/:page
    getReviewsBelongToStudent = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const id_student = req.params.studentId;

            const currentPage: number = +req.params.page;
            
            const pageSize: number = parseInt(process.env.SIZE_OF_PAGE || '10');

            const count = await Review.count({
                where: { id_student }
            });

            const reviews = await Review.findAll({
                where: { id_student },
                limit: pageSize,
                offset: pageSize * (currentPage - 1)
            });

            let totalRating = 0;

            for (const review of reviews) {
                totalRating += review.rating;
            }

            let response = {
                reviews,
                averageRating: totalRating / reviews.length
            }

            res.status(200).json({
                count,
                response
            });
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ error });
        }
    }

    // [POST] /reviews
    createReview = async (req: Request, res: Response, _next: NextFunction) => {
        const t = await sequelize.transaction();
        try {
            const id_student = req.student.data.id;
            let body = req.body.data;

            if (typeof body === "string") {
                body = JSON.parse(body);
            }

            if (body.id_exam) {
                const exam = await Exam.findByPk(body.id_exam);
                let total_review: number = exam.total_review;
                let average_rating: number = exam.average_rating;

                const review = await Review.findOne({
                    where: {
                        id_student,
                        id_exam: body.id_exam
                    }
                });

                if (review) {
                    const deletedRating = review.rating;
                    average_rating = ((average_rating * total_review) - deletedRating + body.rating) / total_review;
                    await review.destroy({ transaction: t });
                } else {
                    total_review += 1;
                    average_rating = ((average_rating * exam.total_review) + body.rating) / total_review;
                }

                await exam.update({
                    average_rating,
                    total_review
                }, {
                    transaction: t
                });
            } else {
                const combo = await Combo.findByPk(body.id_combo);
                let total_review: number = combo.total_review;
                let average_rating: number = combo.average_rating;

                const review = await Review.findOne({
                    where: {
                        id_student,
                        id_combo: body.id_combo
                    }
                });

                if (review) {
                    const deletedRating = review.rating;
                    average_rating = ((average_rating * total_review) - deletedRating + body.rating) / total_review;
                    await review.destroy({ transaction: t });
                } else {
                    total_review += 1;
                    average_rating = ((average_rating * combo.total_review) + body.rating) / total_review;
                }

                await combo.update({
                    average_rating,
                    total_review
                }, {
                    transaction: t
                });
            }
            
            const newReview = await Review.create({
                id_student,
                ...body
            }, {
                transaction: t
            });

            await t.commit();

            res.status(201).json(newReview);
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ error });

            await t.rollback();
        }
    }

    uploadReviewImage = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const file = req.file;

            if (file) {
                const dateTime = fileUpload.giveCurrentDateTime();
    
                const storageRef = ref(
                    storage,
                    `reviews/${file?.originalname + '       ' + dateTime}`
                );
    
                // Create file metadata including the content type
                const metadata = {
                    contentType: file?.mimetype,
                };
    
                // Upload the file in the bucket storage
                const snapshot = await uploadBytesResumable(
                    storageRef,
                    file?.buffer,
                    metadata
                );
    
                // Grab the public url
                const downloadURL = await getDownloadURL(snapshot.ref);
                req.ImageUrl = downloadURL;
            }

            next();
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ error });
        }
    }

    // [DELETE] /reviews/:reviewId
    deleteReview = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const review = await Review.findByPk(req.params.reviewId);

            if (!review) return res.status(404).json({ message: "Review does not exist" });

            await review.destroy();

            res.status(200).json({
                id: req.params.reviewId,
                message: "Review has been deleted"
            })
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ error });
        }
    }
}

module.exports = new ReviewController();