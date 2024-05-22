const ReportError = require('../../db/model/report_error');
const Question = require('../../db/model/question');

import { Request, Response, NextFunction } from "express";
const createError = require('http-errors');


class CheckingReport {
    checkReportQuestion = async (req: Request, _res: Response, next: NextFunction) => {
        try {
            const id_question = req.params.questionId;

            const question = await Question.findByPk(id_question);

            if (!question) {
                let error = "Question does not exist!";
                return next(createError.BadRequest(error));
            }
            next();
        } catch (error: any) {
            console.log(error.message);
            next(createError.InternalServerError(error.message));
        }
    }
}

module.exports = new CheckingReport();