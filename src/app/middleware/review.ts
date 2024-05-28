const Exam = require('../../db/model/exam');
const Review = require('../../db/model/review');
const Combo = require('../../db/model/combo');

import axios from "axios";
import { Request, Response, NextFunction } from "express";
const createError = require('http-errors');

require('dotenv').config();


class CheckingReview {
    checkCreateReview = async (req: Request, _res: Response, next: NextFunction) => {
        try {
            const body = req.body.data;

            if (!body.id_exam && !body.id_combo) {
                let error = "You must choose exam or combo to review!";
                return next(createError.BadRequest(error));
            }
            
            if (body.id_exam) {
                const exam = await Exam.findByPk(body.id_exam);
                if (!exam) {
                    let e = "Exam does not exist!";
                    return next(createError.BadRequest(e));
                }
            }

            if (body.id_combo) {
                const combo = await Combo.findByPk(body.id_combo);
                if (!combo) {
                    let e = "Combo does not exist!";
                    return next(createError.BadRequest(e));
                }
            }
           
            next();
        } catch (error: any) {
            console.log(error.message);
            next(createError.InternalServerError(error.message));
        }
    }

    checkDeleteReview = async (req: Request, _res: Response, next: NextFunction) => {
        try {
            const id_user = req.user?.user.data.id;
            const role = req.user?.role;
            const id_review = req.params.reviewId;

            const review = await Review.findByPk(id_review);

            if (id_user !== review.id_student && role !== "admin") {
                let error = "You do not have permission to delete this review!"
                return next(createError.Unauthorized(error));
            }
            next();
        } catch (error: any) {
            console.log(error.message);
            next(createError.InternalServerError(error.message));
        }
    }
}

module.exports = new CheckingReview();