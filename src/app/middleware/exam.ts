const Exam = require('../../db/model/exam');

import { Request, Response, NextFunction } from "express";
const createError = require('http-errors');

class CheckingExam {
    checkGetSingleExam = async (req: Request, _res: Response, next: NextFunction) => {
        try {
            const id_exam = req.params.examId;

            const exam = await Exam.findByPk(id_exam);

            if (!exam) {
                let error = "Exam does not exist!";
                return next(createError.BadRequest(error));
            }
            next();
        } catch (error: any) {
            console.log(error.message);
            next(createError.InternalServerError(error.message));
        }
    }

    checkModifyExam = async (req: Request, _res: Response, next: NextFunction) => {
        try {
            const id_teacher = req.teacher?.data.id;
            const id_exam = req.params.examId;

            const exam = await Exam.findByPk(id_exam);
            if (!exam) {
                let error = "Exam does not exist!";
                return next(createError.BadRequest(error));
            }
            if (exam.id_teacher !== id_teacher) {
                let error = "You do not have permission to do this action!";
                return next(createError.Unauthorized(error));
            }
            next();
        } catch (error: any) {
            console.log(error.message);
            next(createError.InternalServerError(error.message));
        }
    }

    checkSearchExam = async (req: Request, _res: Response, next: NextFunction) => {
        try {
            if (req.authority === 0) {
                return next();
            }
            const role = req.user?.role;
            const id_user = req.user?.user.data.id;

            const id_teacher = req.query.id_teacher;

            if (role !== "admin" || id_user === id_teacher) {
                req.authority = 2;
            } else {
                req.authority = 1;
            }
            next();
        } catch (error: any) {
            console.log(error.message);
            next(createError.InternalServerError(error.message));
        }
    }

    checkGetExamCreatedByTeacher = async (req: Request, _res: Response, next: NextFunction) => {
        try {
            const id_teacher = req.params.teacherId;
            const id_user = req.user?.user.data.id;
            const role = req.user?.role;

            if (id_user === id_teacher || role === "admin") {
                req.authority = 2;
            }
            next();
        } catch (error: any) {
            console.log(error.message);
            next(createError.InternalServerError(error.message));
        }
    } 
}


module.exports = new CheckingExam();