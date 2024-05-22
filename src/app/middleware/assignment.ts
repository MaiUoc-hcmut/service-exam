const Assignment = require('../../db/model/assignment');
const Exam = require('../../db/model/exam');
const DetailQuestion = require('../../db/model/detail_question');

const createError = require('http-errors');

import { Request, Response, NextFunction } from "express";

require('dotenv').config();

class CheckingAssignment {
    checkSubmitAssignment = async (req: Request, _res: Response, next: NextFunction) => {
        try {
            
        } catch (error: any) {
            console.log(error.message);
            next(createError.InternalServerError(error.message));
        }
    }

    checkGetAssignmentsOfStudent = async (req: Request, _res: Response, next: NextFunction) => {
        try {
            const id_student = req.params.studentId;
            const id_assignment = req.params.assignmentId;
            const id_exam = req.params.examId;

            const id_user = req.user?.user?.data.id;
            const role = req.user?.role;

            // For API get list assignment of student
            if (id_student) {
                if (role !== "admin" && id_user !== id_student) {
                    let error = "You do not have permission to get this data!";
                    return next(createError.Unauthorized(error));
                }
            }

            // For API get detaill of single assignment
            if (id_assignment) {
                const assignment = await Assignment.findByPk(id_assignment);
                if (!assignment) {
                    let error = "Assignment does not exist!";
                    return next(createError.BadRequest(error));
                }
                const exam = await Exam.findByPk(assignment.id_exam);
                if (role !== "admin" && id_user !== assignment.id_student && id_user !== exam.id_teacher) {
                    let error = "You do not have permission to get this data!";
                    return next(createError.Unauthorized(error));
                }

                if (role === "admin" || id_user === exam.id_teacher) req.authority = 2;
            }

            // For API get assignment of exam
            if (id_exam) {
                const exam = await Exam.findByPk(id_exam);
                if (!exam) {
                    let error = "Exam does not exist!";
                    return next(createError.BadRequest(error));
                }
                if (role !== "admin" && id_user !== id_student) {
                    let error = "You do not have permission to get this data!";
                    return next(createError.Unauthorized(error));
                }

                if (role === "admin") req.authority = 2;
            }
            next();
        } catch (error: any) {
            console.log(error.message);
            next(createError.InternalServerError(error.message));
        }
    }

    checkGetAssignmentsOfExam = async (req: Request, _res: Response, next: NextFunction) => {
        try {
            const id_exam = req.params.examId;
            const id_user = req.user?.user?.data.id;
            const role = req.user?.role;

            const exam = await Exam.findByPk(id_exam);
            if (!exam) {
                let error = "Exam does not exit";
                return next(createError.BadRequest(error));
            }

            if (role !== "admin" && id_user !== exam.id_teacher) {
                let error = "You do not have permission to get this data!";
                return next(createError.Unauthorized(error));
            }

            next();

        } catch (error: any) {
            console.log(error.message);
            next(createError.InternalServerError(error.message));
        }
    }

    checkGetAssignmentsOfExamsOfTeacher = async (req: Request, _res: Response, next: NextFunction) => {
        try {
            const id_teacher = req.params.teacherId;
            const id_user = req.user?.user.data.id;
            const role = req.user?.role;

            if (id_user !== id_teacher && role !== "admin") {
                let error = "You do not have permission to get this information!"
                return next(createError.Unauthorized(error));
            }

            next();
        } catch (error: any) {
            console.log(error.message);
            next(createError.InternalServerError(error.message));
        }
    }

    checkCommentDetailQuestion = async (req: Request, _res: Response, next: NextFunction) => {
        try {
            const id_detail_question = req.params.detail_questionId;
            const id_user = req.user?.user.data.id;

            const body = req.body.data;
            if (!body.draft) {
                let error = "You must provide draft comment of detail question";
                return next(createError.BadRequest(error));
            }

            const detail_question = await DetailQuestion.findByPk(id_detail_question);
            if (!detail_question) {
                let error = "This detail question does not exist!";
                return next(createError.BadRequest(error));
            }

            const assignment = await Assignment.findByPk(detail_question.id_assignment);
            const exam = await Exam.findByPk(assignment.id_exam);
            if (id_user !== exam.id_teacher) {
                let error = "You do not have permission to do this action!";
                return next(createError.Unauthorized(error));
            }
            next();

        } catch (error: any) {
            console.log(error.message);
            next(createError.InternalServerError(error.message));
        }
    }

    checkCommentOnAssignment = async (req: Request, _res: Response, next: NextFunction) => {
        try {
            const id_assignment = req.params.assignmentId;
            const id_user = req.user?.user.data.id;

            const assignment = await Assignment.findByPk(id_assignment);
            if (!assignment) {
                let error = "Assignment does not exist!";
                return next(createError.BadRequest(error));
            }
            const exam = await Exam.findByPk(assignment.id_exam);
            if (id_user !== exam.id_teacher) {
                let error = "You do not have permission to do this action!";
                return next(createError.Unauthorized(error));
            }
            next();
        } catch (error: any) {
            console.log(error.message);
            next(createError.InternalServerError(error.message));
        }
    }
}

module.exports = new CheckingAssignment();