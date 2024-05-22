const Exam = require('../../db/model/exam');
const Combo = require('../../db/model/combo');

import { Request, Response, NextFunction } from "express";
const createError = require('http-errors');

class CheckingCombo {
    checkCreateCombo = async (req: Request, _res: Response, next: NextFunction) => {
        try {
            let body = req.body.data;
            if (typeof body === "string") {
                body = JSON.parse(body);
            }

            const { name, price, description, exams } = body;

            if (!name || price < 0 || !description || exams === undefined) {
                let error = "Information Invalid!";
                return next(createError.BadRequest(error));
            }
            next();
        } catch (error: any) {
            console.log(error.message);
            next(createError.InternalServerError(error.message));
        }
    }

    checkMofifyCombo = async (req: Request, _res: Response, next: NextFunction) => {
        try {
            const id_combo = req.params.comboId;
            const id_teacher = req.teacher.data.id;

            const combo = await Combo.findByPk(id_combo);
            if (!combo) {
                let error = "This combo does not exist!";
                return next(createError.BadRequest(error));
            }
            if (id_teacher !== combo.id_teacher) {
                let error = "You do not have permission to do this action!";
                return next(createError.Unauthorized(error));
            }
        } catch (error: any) {
            console.log(error.message);
            next(createError.InternalServerError(error.message));
        }
    }
}


module.exports = new CheckingCombo();