const Exam = require('../../db/model/exam');
const Combo = require('../../db/model/combo');
const StudentCombo = require('../../db/model/student_combo');

import { Request, Response, NextFunction } from "express";
const createError = require('http-errors');

class CheckingCombo {
    checkCreateCombo = async (req: Request, _res: Response, next: NextFunction) => {
        try {
            let body = req.body.data;
            if (typeof body === "string") {
                body = JSON.parse(body);
            }

            const { name, price, description, exams, categories } = body;

            if (
                !name || 
                price < 0 || 
                !description || 
                exams === undefined || 
                categories === undefined || 
                !Array.isArray(categories) || 
                categories.length === 0
            ) 
            {
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

    checkStudentBuyCombo = async (req: Request, _res: Response, next: NextFunction) => {
        try {
            const id_student = req.student.data.id;
            const id_combo = req.params.comboId;

            const record = await StudentCombo.findOne({
                where: {
                    id_combo,
                    id_student
                }
            });

            if (record) {
                let error = "This student had have bought this combo!"
                return next(createError.BadRequest(error));
            }
            next();
        } catch (error: any) {
            console.log(error.message);
            next(createError.InternalServerError(error.message));
        }
    }

    checkGetDetailCombo = async (req: Request, _res: Response, next: NextFunction) => {
        try {
            if (req.authority === 0) next();

            const id_user = req.user?.user.data.id;
            const role = req.user?.role;
            const id_combo = req.params.comboId;

            const combo = await Combo.findByPk(id_combo);

            let user: {
                user?: any,
                role?: string
            } = {
                user: req.user?.user,
                role: req.user?.role
            }
            if ((role === "teacher" && id_user === combo.id_teacher) || role === "admin") {
                req.authority = 2;
                req.user = user;
                return next();
            }

            const record = await StudentCombo.findOne({
                where: {
                    id_student: id_user,
                    id_combo
                }
            });

            if (record) {
                req.authority = 1;
                req.user = user;
                return next();
            }

            const response = await axios.get(`${process.env.BASE_URL_PAYMENT_LOCAL}/cart/check/${id_combo}/${id_user}?product=combo`);
            if (response.data.result) {
                req.authority = -1;
                req.user = user;
                return next();
            }
            req.authority = 0;
            req.user = user;
            next();
        } catch (error: any) {
            console.log(error.message);
            next(createError.InternalServerError(error.message));
        }
    }
}


module.exports = new CheckingCombo();