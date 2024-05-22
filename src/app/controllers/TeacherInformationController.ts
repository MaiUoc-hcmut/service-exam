const Exam = require('../../db/model/exam');
const Assignment = require('../../db/model/assignment');
const Review = require('../../db/model/review');

import { Request, Response, NextFunction } from 'express';

const { Op } = require('sequelize');

class TeacherInformationController {

    // [GET] /teacher/:teacherId
    getExamServiceInformation = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const id_teacher = req.params.teacherId;
            
            const startDay = new Date();
            startDay.setHours(0, 0, 0, 0)

            const exam_quantity = await Exam.count({
                where: {
                    id_teacher,
                    id_course: {
                        [Op.or]: [null, ""]
                    }
                }
            });

            const newAssignmentOnDay = await Assignment.count({
                include: [{
                    model: Exam,
                    where: {
                        id_teacher
                    }
                }],
                where: {
                    createdAt: {
                        [Op.gte]: startDay
                    }
                }
            })

            const newReviewExamOnDay = await Review.count({
                include: [{
                    model: Exam,
                    where: {
                        id_teacher
                    }
                }],
                where: {
                    createdAt: {
                        [Op.gte]: startDay
                    }
                }
            })

            res.status(200).json({
                exam_quantity,
                newAssignmentOnDay,
                newReviewExamOnDay
            });
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ error, message: error.message });
        }
    }
}

module.exports = new TeacherInformationController();