const Exam = require('../../db/model/exam');
const Question = require('../../db/model/question');
const Answer = require('../../db/model/answer');
const Category = require('../../db/model/category');
const ParentCategory = require('../../db/model/par_category');
const ExamDraft = require('../../db/model/exam_draft');
const Knowledge = require('../../db/model/knowledge');
const Error = require('../../db/model/error');
const { Op } = require("sequelize");

const algoliasearch = require('algoliasearch');

const { sequelize } = require('../../config/db/index');
const axios = require('axios');

import { log } from "console";
import { Request, Response, NextFunction } from "express";


require('dotenv').config();

declare global {
    interface ImageURL {
        thumbnail: string;
        cover: string;
    }
    namespace Express {
        interface Request {
            teacher?: any;
            student?: any;
            authority?: number,
            URL: ImageURL
        }
        
    }
}

class ExamController {

    // Get all exam
    // [GET] /api/v1/exam
    getAllExams = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const authority = req.authority;

            let status = authority === 2
                ? ['public', 'paid', 'private']
                : ['public', 'paid'];

            const levelCondition: any[] = [];
            const subjectCondition: any[] = [];
            const classCondition: any[] = [];

            const { class: _class, subject, level } = req.query;

            if (!_class) {

            } else if (Array.isArray(_class)) {
                classCondition.push(..._class);
            } else {
                classCondition.push(_class);
            }

            if (!subject) {

            } else if (Array.isArray(subject)) {
                subjectCondition.push(...subject);
            } else {
                subjectCondition.push(subject);
            }

            if (!level) {

            } else if (Array.isArray(level)) {
                levelCondition.push(...level);
            } else {
                levelCondition.push(level)
            }

            enum SortQuery {
                Rating = 'rating',
                Date = 'date',
            }
            enum SortOrder {
                ASC = 'asc',
                DESC = 'desc'
            }

            const sortFactor = {
                [SortQuery.Rating]: 'average_rating',
                [SortQuery.Date]: 'createdAt',
            }
            const orderFactor = {
                [SortOrder.ASC]: 'asc',
                [SortOrder.DESC]: 'desc',
            }


            const sortQuery = req.query.sort as SortQuery;
            const orderSort = req.query.order as SortOrder;

            let defaultQuery = 'createdAt';
            let defaultOrder = 'desc';

            if (typeof sortQuery === "string" && Object.values(SortQuery).includes(sortQuery)) {
                defaultQuery = sortFactor[sortQuery as SortQuery];
            }
            if (typeof orderSort === "string" && Object.values(SortOrder).includes(orderSort)) {
                defaultOrder = orderFactor[orderSort as SortOrder];
            }

            const currentPage: number = +req.params.page;
            const pageSize: number = authority === 2 ? 20 : parseInt(process.env.SIZE_OF_PAGE || '10');

            const queryOption: any = {
                where: { status },
                include: [
                    {
                        model: Category,
                        through: {
                            attributes: [],
                        },
                    },
                ]
            }

            const { exam: examQuery } = req.query;

            if (examQuery === "true") {
                queryOption.where.id_course = null;
            }
            if (examQuery === "false") {
                queryOption.where.id_course = {
                    [Op.ne]: null
                }
            }

            let categoryLength = 0;

            if (classCondition.length > 0 || levelCondition.length > 0 || subjectCondition.length > 0) {
                queryOption.include[0].where = {
                    id: {
                        [Op.or]: [
                            { [Op.or]: classCondition },
                            { [Op.or]: levelCondition },
                            { [Op.or]: subjectCondition }
                        ]
                    }
                }
                if (levelCondition.length > 0) {
                    categoryLength++;
                }
                if (classCondition.length > 0) {
                    categoryLength++;
                }
                if (subjectCondition.length > 0) {
                    categoryLength++;
                }
                queryOption.group = ['Course.id'];
                queryOption.having = sequelize.literal("COUNT(DISTINCT " + `Categories` + "." + `id` + `) = ${categoryLength}`);
            }

            const count = await Exam.findAll({
                ...queryOption
            });

            const exams = await Exam.findAll({
                ...queryOption,
                order: [[defaultQuery, defaultOrder]],
                limit: pageSize,
                offset: pageSize * (currentPage - 1)
            });


            for (const exam of exams) {
                const user = await axios.get(`${process.env.BASE_URL_USER_LOCAL}/teacher/get-teacher-by-id/${exam.id_teacher}`);
                exam.dataValues.user = { id: user.data.id, name: user.data.name };

                const exam_category = await Exam.findOne({
                    where: {
                        id: exam.id
                    },
                    attributes: [],
                    include: [
                        {
                            model: Category,
                            attributes: ['id', 'id_par_category', 'name'],
                            through: {
                                attributes: []
                            }
                        }
                    ]
                });

                for (const category of exam_category.Categories) {
                    const parCategory = await ParentCategory.findByPk(category.id_par_category);
                    category.dataValues[`${parCategory.name}`] = category.name;
                    delete category.dataValues.name;
                    delete category.dataValues.id_par_category;
                }

                exam.dataValues.Categories = exam_category.dataValues.Categories;
            }

            res.status(200).json({
                count: count.length,
                exams
            });
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ error: error.message });
        }
    }

    // Get single exam by its id
    // [GET] /api/v1/exams/:examId
    getExamById = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const examId = req.params.examId;
            const exam = await Exam.findByPk(examId);

            if (!exam) return res.status(404).json({ message: "Exam not found!" });

            res.status(200).json(exam);
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ error: error.message });
        }
    }

    // Get all exam that created by teacher
    // [GET] /api/v1/exams/teacher/:teacherId/page/:page
    getExamCreatedByTeacher = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const authority = req.authority;

            let status = authority === 2
                ? ['public', 'paid', 'private']
                : ['public', 'paid'];
            const teacherId = req.params.teacherId;

            const pageSize: number = authority === 2 ? 20 : parseInt(process.env.SIZE_OF_PAGE || '10');
            const currentPage: number = +req.params.page;

            const { exam: examQuery } = req.query;


            const whereCondition: any = {
                status,
                id_teacher: teacherId
            }

            if (examQuery === "true") {
                whereCondition.id_course = null;
            }
            if (examQuery === "false") {
                whereCondition.id_course = {
                    [Op.ne]: null
                }
            }

            const count = await Exam.count({
                where: whereCondition
            });

            const exams = await Exam.findAll({
                where: whereCondition,
                include: [
                    {
                        model: Category,
                        attributes: ['name', 'id_par_category'],
                        through: {
                            attributes: []
                        }
                    },
                ],
                limit: pageSize,
                offset: pageSize * (currentPage - 1)
            });

            for (const exam of exams) {
                // Format category before response
                for (const category of exam.Categories) {
                    const parCategory = await ParentCategory.findByPk(category.id_par_category);
                    category.dataValues[`${parCategory.name}`] = category.name;

                    delete category.dataValues.name;
                    delete category.dataValues.id_par_category;
                }
            }

            res.status(200).json({ count, exams });
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ error: error.message });
        }
    }

    // [GET]/api/v1/exams/full/:examId
    getDetailExam = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const id_exam = req.params.examId;

            const isAll = req.query.all;
            let option = "delete";
            if (isAll !== undefined && isAll === "1") {
                option = ""
            }

            const exam = await Exam.findByPk(id_exam, {
                include: [
                    {
                        model: Question,
                        where: {
                            status: {
                                [Op.ne]: `${option}`
                            }
                        },
                        as: 'questions',
                        include: [
                            {
                                model: Answer,
                                as: 'answers'
                            },
                            {
                                model: Knowledge,
                                attributes: ['name'],
                                through: {
                                    attributes: []
                                }
                            },
                            {
                                model: Error
                            }
                        ]
                    },
                    {
                        model: Category,
                        attributes: ['id', 'name', 'id_par_category'],
                        through: {
                            attributes: []
                        }
                    }
                ]
            });

            let knowledges: {
                name: string,
                questions: string[]
            }[] = [];
            if (exam.questions) {
                for (const question of exam.questions) {
                    if (question.Knowledge.length === 0) {
                        const foundObject = knowledges.find(o => o.name === "other");
                        if (!foundObject) {
                            knowledges.push({
                                name: "other",
                                questions: [question.id]
                            });
                        } else {
                            foundObject.questions.push(question.id);
                        }
                        continue;
                    }

                    for (const knowledge of question.Knowledge) {
                        const foundObject = knowledges.find(o => o.name === knowledge.name);
                        if (!foundObject) {
                            knowledges.push({
                                name: knowledge.name,
                                questions: [question.id]
                            });
                        } else {
                            foundObject.questions.push(question.id);
                        }
                    }
                }
            }

            if (exam.Categories) {
                for (const category of exam.Categories) {
                    const parCategory = await ParentCategory.findByPk(category.id_par_category);
                    category.dataValues[`${parCategory.name}`] = category.name;
                    delete category.dataValues.name;
                    delete category.dataValues.id_par_category;
                }
            }

            exam.dataValues.classification = knowledges;

            const topic = await axios.get(`${process.env.BASE_URL_COURSE_LOCAL}/topics/check/exam/${exam.id}`);

            exam.dataValues.id_topic = topic.data.id_topic;

            res.status(200).json(exam);
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ error: error.message });
        }
    }

    // [GET] /api/v1/exams/search/page/:page
    searchExam = async (req: Request, res: Response, _next: NextFunction) => {
        const client = algoliasearch(process.env.ALGOLIA_APPLICATION_ID, process.env.ALGOLIA_ADMIN_API_KEY);
        const index = client.initIndex(process.env.ALGOLIA_INDEX_NAME);
        try {
            const authority = req.authority;
            const currentPage: number = +req.params.page;
            const pageSize: number = authority === 2 ? 20 : parseInt(process.env.SIZE_OF_PAGE || '10');


            const { query, id_teacher } = req.query;

            let filters = `id_course:0`;
            if (typeof id_teacher === "string") {
                filters += ` AND id_teacher:${id_teacher}`
            }
            if (authority !== 2) {
                filters += ` AND status:public`
            }

            const result = await index.search(query, {
                hitsPerPage: pageSize,
                page: currentPage - 1,
                filters
            });

            res.status(200).json({
                total: result.nbHits,
                result: result.hits,
            })
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ error: error.message });
        }
    }

    // Create an exam
    // [POST] /api/v1/exams
    createExam = async (req: Request, res: Response, _next: NextFunction) => {
        let body = req.body.data;
        console.log(req.body.data);

        if (typeof body === "string") {
            body = JSON.parse(body);
        }

        const client = algoliasearch(process.env.ALGOLIA_APPLICATION_ID, process.env.ALGOLIA_ADMIN_API_KEY);
        const index = client.initIndex(process.env.ALGOLIA_INDEX_NAME);

        const t = await sequelize.transaction();
        try {
            const { title, period, status, questions, id_course, categories, pass_score } = body;
            const quantity_question = questions.length;
            const id_teacher = req.teacher.data.id;

            if (!title || !period) {
                return res.status(400).json({ message: "Information missed!" });
            }

            if (!categories || categories.length === 0) {
                return res.status(400).json({ message: "Category missed!" });
            }

            if (!questions || questions.length === 0) {
                return res.status(400).json({ message: "Questions missed!" });
            }

            if (!pass_score && id_course) {
                return res.status(400).json({ message: "Pass score missed!" });
            }

            if (pass_score < 0 || pass_score > 10) {
                return res.status(400).json({ message: "Pass score must be in range 0 to 10" });
            }

            let categoryInstances: any[] = [];
            for (const id of categories) {
                const category = await Category.findByPk(id);
                categoryInstances.push(category);
            }

            const actualStatus = status !== undefined ? status : true;

            const newExam = await Exam.create({
                id_teacher,
                id_course,
                title,
                period,
                quantity_question,
                pass_score,
                status: actualStatus
            }, {
                transaction: t
            });

            await newExam.addCategories(categoryInstances, { transaction: t });


            for (const question of questions) {
                const { question_categories, knowledges, answers, ...questionBody } = question;

                if (!answers) {
                    return res.status(400).json({
                        message: "Question must have its own answers!"
                    });
                }

                const questionDraft = await ExamDraft.findOne({
                    where: { id_question: questionBody.id }
                });

                let content_image = "";

                // If draft exist, means image of question has been uploaded
                if (questionDraft) {
                    content_image = questionDraft.url;
                    await questionDraft.destroy({ transaction: t });
                }



                const newQuestion = await Question.create({
                    id_exam: newExam.id,
                    id_teacher,
                    ...questionBody,
                    content_image
                }, {
                    transaction: t
                });

                if (question_categories) {
                    let questionCategoryInstances: any[] = [];
                    for (const id of question_categories) {
                        const category = await Category.findByPk(id);
                        questionCategoryInstances.push(category);
                    }

                    newQuestion.addCategories(questionCategoryInstances, { transaction: t });
                }

                if (knowledges) {
                    for (const id of knowledges) {
                        const knowledge = await Knowledge.findByPk(id);

                        if (!knowledge) {
                            return res.status(400).json({
                                message: "Knowledge does not exist!",
                                knowledge: id
                            });
                        }
                        await newQuestion.addKnowledge(knowledge, { transaction: t });
                    }
                }

                const rightAnswer = answers.filter((answer: any) => answer.is_correct === true);
                if (!rightAnswer) {
                    return res.status(400).json({
                        message: "Ques tion must have at least 1 right answer",
                        question
                    });
                }
                for (const answer of answers) {
                    let answer_image = "";

                    const answerDraft = await ExamDraft.findOne({
                        where: { id_answer: answer.id, type: "answer" }
                    });

                    if (answerDraft) {
                        answer_image = answerDraft.url;
                        await answerDraft.destroy({ transaction: t });
                    }

                    await Answer.create({
                        id_question: newQuestion.id,
                        ...answer,
                        content_image: answer_image
                    }, {
                        transaction: t
                    });
                }
            }

            if (!id_course) {
                const data = {
                    id_user: id_teacher,
                    id_exam: newExam.id,
                    name: newExam.title
                }

                const response = await axios.get(`${process.env.BASE_URL_NOTIFICATION_LOCAL}/notification/create-exam`, { data });
            }

            await t.commit();

            // const Categories = categoryInstances.map(({ id, name }) => ({ id, name }));
            const user = { id: id_teacher, name: req.teacher?.data.name };

            let dataValues = newExam.dataValues;

            if (!newExam.id_course) {
                dataValues.id_course = 0;
            }

            const algoliaDataSave = {
                ...dataValues,
                objectID: newExam.id,
                // Categories,
                user
            }

            // Save data to algolia
            await index.saveObject(algoliaDataSave);

            res.status(201).json(newExam);
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ error: error.message });

            await t.rollback();
        }
    }

    // [PUT] /api/v1/exams/:examId
    updateExam = async (req: Request, res: Response, _next: NextFunction) => {
        const t = await sequelize.transaction();

        const client = algoliasearch(process.env.ALGOLIA_APPLICATION_ID, process.env.ALGOLIA_ADMIN_API_KEY);
        const index = client.initIndex(process.env.ALGOLIA_INDEX_NAME);
        try {
            let body = req.body.data;

            if (typeof body === "string") {
                body = JSON.parse(body);
            }

            let { categories, questions, ...examBody } = body;
            const examId = req.params.examId;
            const exam = await Exam.findByPk(examId);
            let quantity_question = exam.quantity_question;

            let Categories: any[] = [];

            if (categories !== undefined && categories.length > 0) {
                const categoriesList: any[] = [];
                for (const category of categories) {
                    const categoryRecord = await Category.findByPk(category);
                    if (!categoryRecord) throw new Error("Category does not exist");
                    categoriesList.push(categoryRecord);
                }
                await exam.setCategories(categoriesList, { transaction: t });
                Categories = categoriesList.map(({ id, name }) => ({ id, name }));
            }

            if (questions !== undefined && questions.length > 0) {
                for (const question of questions) {
                    const { answers, modify, ...questionBody } = question;

                    // If data receive does not contain modify field, means this question does not need to be update, then continue the loop
                    if (modify === undefined) {
                        continue
                    }

                    // If question need to delete from the exam
                    else if (modify === "delete") {
                        const questionToDelete = await Question.findByPk(question.id);

                        if (!questionToDelete) throw new Error(`question with id ${question.id} does not exist`);

                        // Update status of this question to delete
                        await questionToDelete.update({
                            status: "delete"
                        }, {
                            transaction: t
                        });
                        quantity_question--;
                    }

                    // If new question need to be add to exam
                    else if (modify === "create") {
                        if (answers === undefined || answers.length === 0) {
                            return res.status(400).json({
                                message: "Question must have its own answers!"
                            });
                        }
                        let questionUrl = "";
                        const questionDraft = await ExamDraft.findOne({
                            where: { id_question: question.id, type: "question" }
                        });
                        if (questionDraft) {
                            questionUrl = questionDraft.url;
                            await questionDraft.destroy({ transaction: t });
                        }
                        await Question.create({
                            ...questionBody,
                            id_exam: examId,
                            content_image: questionUrl,
                            id_teacher: exam.id_teacher
                        }, { transaction: t });
                        quantity_question++;

                        // Create new answers for question
                        for (const answer of answers) {
                            let answerUrl = "";
                            const answerDraft = await ExamDraft.findOne({
                                where: { id_answer: answer.id, type: "answer" }
                            });

                            if (answerDraft) {
                                answerUrl = answerDraft.url;
                                await answerDraft.destroy({ transaction: t });
                            }

                            await Answer.create({ ...answer, id_question: question.id, content_image: answerUrl }, { transaction: t });
                        }
                    }

                    // The last state of modify is change
                    else {
                        const questionToUpdate = await Question.findByPk(question.id);

                        let questionUrl = questionToUpdate.content_image;

                        const questionDraft = await ExamDraft.findOne({
                            where: { id_question: question.id, type: "question" }
                        });

                        if (questionDraft) {
                            questionUrl = questionDraft.url;
                            await questionDraft.destroy({ transaction: t });
                        }

                        questionBody.content_image = questionUrl;
                        if (questionBody.id !== undefined) {
                            delete questionBody.id;
                        }

                        // create new question with the same data as old question
                        const newQuestion = await Question.create({
                            ...questionBody
                        }, {
                            transaction: t
                        });

                        // Update status of old question to delete
                        await questionToUpdate.update({ status: "delete" }, { transaction: t });

                        // create new answers with the same data as old answers
                        for (const answer of answers) {
                            const { answerModify, ...answerBody } = answer;

                            // If answerModify state is delete, skip this answer
                            if (answerModify === "delete") {
                                continue;
                            }

                            const answerToUpdate = await Answer.findByPk(answer.id);

                            let answerUrl = answerToUpdate.content_image;
                            const answerDraft = await ExamDraft.findOne({
                                where: { id_answer: answer.id, type: "answer" }
                            });

                            if (answerDraft) {
                                answerUrl = answerDraft.url;
                                await answerDraft.destroy({ transaction: t });
                            }

                            if (answerBody.id_question !== undefined) {
                                delete answerBody.id_question;
                            }

                            if (answerBody.id !== undefined) {
                                delete answerBody.id;
                            }

                            await Answer.create({
                                ...answerBody,
                                id_question: newQuestion.id,
                                content_image: answerUrl
                            }, {
                                transaction: t
                            });
                        }
                    }
                }
            }

            await exam.update({ quantity_question, ...examBody }, { transaction: t });

            await t.commit();

            const dataToUpdate = {
                ...examBody,
                objectID: examId,
                Categories
            }
            index.partialUpdateObject(dataToUpdate);

            res.status(200).json(exam);
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ error, message: error.message });

            await t.rollback();
        }
    }

    // Delete an exam
    // [DELETE] /api/v1/exams/:examId
    deleteExam = async (req: Request, res: Response, _next: NextFunction) => {
        const client = algoliasearch(process.env.ALGOLIA_APPLICATION_ID, process.env.ALGOLIA_ADMIN_API_KEY);
        const index = client.initIndex(process.env.ALGOLIA_INDEX_NAME);

        const t = await sequelize.transaction();
        try {
            const examId = req.params.examId;

            await Exam.destroy({
                where: { id: examId }
            }, {
                transaction: t
            });

            await t.commit();

            await index.deleteObject(examId);

            res.status(200).json({
                examId,
                message: "Exam has been deleted",
            })
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ error: error.message });

            await t.rollback();
        }
    }
}


module.exports = new ExamController();
