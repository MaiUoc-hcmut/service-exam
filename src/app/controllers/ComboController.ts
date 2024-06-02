const Exam = require('../../db/model/exam');
const Combo = require('../../db/model/combo');
const Question = require('../../db/model/question');
const StudentCombo = require('../../db/model/student_combo');
const Category = require('../../db/model/category');
const ParentCategory = require('../../db/model/par_category');

const { sequelize } = require('../../config/db/index');
const axios = require('axios');

const algoliasearch = require('algoliasearch');

import { Request, Response, NextFunction } from "express";
const { Op } = require('sequelize');

const fileUpload = require('../../config/firebase/fileUpload');
const { firebaseConfig } = require('../../config/firebase/firebase');
const {
    ref,
    getDownloadURL,
    uploadBytesResumable,
    deleteObject,
    getStorage,
} = require('firebase/storage');
const { initializeApp } = require('firebase/app');

initializeApp(firebaseConfig);
const storage = getStorage();

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


class ComboController {

    // [GET] /combos/page/:page
    getAllCombos = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const authority = req.authority;
            let status = authority === 2
                            ? ['public', 'paid', 'private', 'draft']
                            : ['public', 'paid'];

            const levelCondition: any[] = [];
            const subjectCondition: any[] = [];
            const classCondition: any[] = [];

            const { class: _class, subject, level } = req.query;

            const minPrice = typeof req.query.minPrice === 'string' ? parseInt(req.query.minPrice) : undefined;
            const maxPrice = typeof req.query.maxPrice === 'string' ? parseInt(req.query.maxPrice) : undefined;

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

            if (Array.isArray(minPrice) || Array.isArray(maxPrice)) {
                throw new Error("MinPrice and MaxPrice should just primitive type, not array type")
            }

            if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
                throw new Error('minPrice must be less than maxPrice.');
            }

            const condition: {
                price: any
            } = {
                price: {
                    [Op.between]: [0, 99999999]
                }
            };

            if (minPrice !== undefined && maxPrice !== undefined) {
                condition.price = {
                    [Op.between]: [minPrice, maxPrice]
                };
            } else if (minPrice !== undefined) {
                condition.price = {
                    [Op.gte]: minPrice
                };
            } else if (maxPrice !== undefined) {
                condition.price = {
                    [Op.lte]: maxPrice
                };
            }

            enum SortQuery {
                Rating = 'rating',
                Date = 'date',
                Price = 'price',
                Registration = 'registration'
            }
            enum SortOrder {
                ASC = 'asc',
                DESC = 'desc'
            }

            const sortFactor = {
                [SortQuery.Rating]: 'average_rating',
                [SortQuery.Date]: 'updatedAt',
                [SortQuery.Price]: 'price',
                [SortQuery.Registration]: 'registration'
            }
            const orderFactor = {
                [SortOrder.ASC]: 'asc',
                [SortOrder.DESC]: 'desc',
            }


            const sortQuery = req.query.sort as SortQuery;
            const orderSort = req.query.order as SortOrder;

            let defaultQuery = 'updatedAt';
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
                where: {
                    ...condition,
                    status
                },
                include: [
                    {
                        model: Category,
                        attributes: ['id', 'id_par_category', 'name'],
                        through: {
                            attributes: [],
                        },
                    },
                ]
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
                queryOption.group = ['Combo.id'];
                queryOption.having = sequelize.literal("COUNT(DISTINCT " + `Categories` + "." + `id` + `) = ${categoryLength}`);
            }

            const count = await Combo.findAll({
                ...queryOption
            });

            const combos = await Combo.findAll({
                ...queryOption,
                order: [[defaultQuery, defaultOrder]],
                limit: pageSize,
                offset: pageSize * (currentPage - 1),
                subQuery: false
            });

            for (const combo of combos) {
                try {
                    const teacher = await axios.get(`${process.env.BASE_URL_USER_LOCAL}/teacher/get-teacher-by-id/${combo.id_teacher}`);
    
                    combo.dataValues.teacher = {
                        id: combo.id_teacher,
                        name: teacher.data.name,
                        avatar: teacher.data.avatar
                    };
                    delete combo.dataValues.id_teacher;
                } catch (error: any) {
                    console.log(error.message);
                }

                const combo_category = await Combo.findOne({
                    where: {
                        id: combo.id
                    },
                    attributes: [],
                    include: [{
                        model: Category,
                        attributes: ['id', 'id_par_category', 'name'],
                        through: {
                            attributes: []
                        }
                    }]
                })

                for (const category of combo_category.Categories) {
                    const parCategory = await ParentCategory.findByPk(category.id_par_category);
                    category.dataValues[`${parCategory.name}`] = category.name;
                    delete category.dataValues.name;
                    delete category.dataValues.id_par_category;
                    delete category.dataValues.createdAt;
                    delete category.dataValues.updatedAt;
                }
                combo.dataValues.Categories = combo_category.dataValues.Categories;
            }

            res.status(200).json({
                count: count.length,
                combos
            });
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ error: error.message });
        }
    }

    // [GET] /combos/:comboId
    getCombo = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const authority = req.authority;

            const id_combo = req.params.comboId;
            const combo = await Combo.findByPk(id_combo, {
                include: [
                    {
                        model: Exam,
                        attributes: ['id', 'title', 'period', 'quantity_question', 'average_rating'],
                        through: {
                            attributes: []
                        }
                    },
                    {
                        model: Category,
                        attributes: ['id', 'id_par_category', 'name'],
                        through: {
                            attributes: []
                        }
                    }
                ]
            });

            for (const category of combo.Categories) {
                const parCategory = await ParentCategory.findByPk(category.id_par_category);
                category.dataValues[`${parCategory.name}`] = category.name;
                delete category.dataValues.name;
                delete category.dataValues.id_par_category;
            }

            let quantity_question = 0;
            for (const exam of combo.Exams) {
                quantity_question += exam.quantity_question;
            }
            combo.dataValues.quantity_question = quantity_question;
            combo.dataValues.quantity_exam = combo.Exams.length;

            if (authority === 1) {
                combo.dataValues.added = true;
                combo.dataValues.cart_or_bought = "bought";
            }
            if (authority === -1) {
                combo.dataValues.added = true;
                combo.dataValues.cart_or_bought = "cart";
            }

            try {
                const teacher = await axios.get(`${process.env.BASE_URL_USER_LOCAL}/teacher/get-teacher-by-id/${combo.id_teacher}`);

                combo.dataValues.teacher = {
                    id: combo.id_teacher,
                    name: teacher.data.name,
                    avatar: teacher.data.avatar
                };
                delete combo.dataValues.id_teacher;
            } catch (error: any) {
                console.log(error.message);
            }

            res.status(200).json(combo);
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ error: error.message });
        }
    }

    // [GET] /combos/:comboId/basic
    getBasicCombo = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const combo = await Combo.findByPk(req.params.comboId);

            res.status(200).json(combo);
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ error: error.message });
        }
    }

    // [GET] /api/v1/combos/teacher/:teacherId/page/:page
    getComboCreatedByTeacher = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const authority = req.authority;

            let status = authority === 2
                            ? ['public', 'paid', 'private']
                            : ['public', 'paid'];
            const id_teacher = req.params.teacherId;

            const pageSize: number = authority === 2 ? 20 : parseInt(process.env.SIZE_OF_PAGE || '10');
            const currentPage: number = +req.params.page;

            const count = await Combo.count({
                where: {
                    id_teacher
                }
            });

            const combos = await Combo.findAll({
                where: {
                    id_teacher,
                    status
                },
                include: [{
                    model: Category,
                    attributes: ['id', 'id_par_category', 'name'],
                    through: {
                        attributes: []
                    }
                }],
                limit: pageSize,
                offset: pageSize * (currentPage - 1)
            });

            for (const combo of combos) {
                // Format category before response
                for (const category of combo.Categories) {
                    const parCategory = await ParentCategory.findByPk(category.id_par_category);
                    category.dataValues[`${parCategory.name}`] = category.name;

                    delete category.dataValues.name;
                    delete category.dataValues.id_par_category;
                }
            }

            res.status(200).json({
                count,
                combos
            })
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ error: error.message });
        }
    }

    // [GET] /combos/student/:studentId/page/:page
    getComboThatStudentBought = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const currentPage: number = +req.params.page;
            const pageSize: number = parseInt(process.env.SIZE_OF_PAGE || '10');
            const id_student = req.params.studentId;

            const count = await StudentCombo.count({
                where: {
                    id_student
                }
            });
            const records = await StudentCombo.findAll({
                where: {
                    id_student
                },
                limit: pageSize,
                offset: pageSize * (currentPage - 1)
            });

            const result: any[] = [];

            for (const record of records) {
                const combo = await Combo.findOne({
                    where: {
                        id: record.id_combo
                    },
                    include: [
                        {
                            model: Exam,
                            attribute: ['id'],
                            through: {
                                attributes: []
                            }
                        },
                        {
                            model: Category,
                            attributes: ['id', 'id_par_category', 'name'],
                            through: {
                                attributes: []
                            }
                        }
                    ]
                });

                for (const category of combo.Categories) {
                    const parCategory = await ParentCategory.findByPk(category.id_par_category);
                    category.dataValues[`${parCategory.name}`] = category.name;

                    delete category.dataValues.name;
                    delete category.dataValues.id_par_category;
                }
                
                try {
                    const teacher = await axios.get(`${process.env.BASE_URL_USER_LOCAL}/teacher/get-teacher-by-id/${combo.id_teacher}`);
    
                    combo.dataValues.teacher = {
                        id: combo.id_teacher,
                        name: teacher.data.name,
                        avatar: teacher.data.avatar
                    };
                    delete combo.dataValues.id_teacher;
                } catch (error: any) {
                    console.log(error.message);
                }

                let question_quantity = 0;
                for (const exam of combo.Exams) {
                    question_quantity += exam.quantity_question;
                }
                combo.dataValues.exam_quantity = combo.Exams.length;
                combo.dataValues.question_quantity = question_quantity;
                delete combo.dataValues.Exams;

                result.push(combo);
            }

            res.status(200).json({
                count,
                combos: result
            });
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ error: error.message });
        }
    }

    // [GET] /combos/search/page/:page
    searchCombo = async (req: Request, res: Response, _next: NextFunction) => {
        const client = algoliasearch(process.env.ALGOLIA_APPLICATION_ID, process.env.ALGOLIA_ADMIN_API_KEY);
        const index = client.initIndex(process.env.ALGOLIA_COMBO_INDEX);
        try {
            const currentPage: number = +req.params.page;
            const pageSize: number = parseInt(process.env.SIZE_OF_PAGE || '10');

            const query = req.query.query;
            let filters = ``;

            const authority = req.authority;
            if (authority !== 2) {
                filters += `status:public OR status:paid`
            }

            const result = await index.search(query, {
                filters,
                hitsPerPage: pageSize,
                page: currentPage - 1
            });

            res.status(200).json({
                total: result.nbHits,
                result: result.hits
            });
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ error: error.message });
        }
    }

    // [GET] /combos/search/teacher/:teacherId/page/:page
    searchComboOfTeacher = async (req: Request, res: Response, _next: NextFunction) => {
        const client = algoliasearch(process.env.ALGOLIA_APPLICATION_ID, process.env.ALGOLIA_ADMIN_API_KEY);
        const index = client.initIndex(process.env.ALGOLIA_COMBO_INDEX);
        try {
            const id_teacher = req.params.teacherId;
            const { query } = req.query;

            const currentPage: number = +req.params.page;
            const pageSize: number = parseInt(process.env.SIZE_OF_PAGE || '10');

            let filters = `id_teacher:${id_teacher}`;
            if (req.authority !== 3) {
                filters += `AND NOT status:draft`;
                if (req.authority !== 2) {
                    filters += `AND NOT status:private`
                }
            }

            const result = await index.search(query, {
                filters,
                hitsPerPage: pageSize,
                page: currentPage - 1
            });

            res.status(200).json({
                total: result.nbHits,
                result: result.hits
            });
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ error: error.message });
        }
    }

    // [POST] /api/v1/combos
    createComboExam = async (req: Request, res: Response, _next: NextFunction) => {
        const client = algoliasearch(process.env.ALGOLIA_APPLICATION_ID, process.env.ALGOLIA_ADMIN_API_KEY);
        const index = client.initIndex(process.env.ALGOLIA_COMBO_INDEX);

        const t = await sequelize.transaction();
        try {
            const id_teacher = req.teacher.data.id;
            const teacher_name = req.teacher.data.name;

            let body = req.body.data;
            if (typeof body === "string") {
                body = JSON.parse(body);
            }

            // const { thumbnail, cover } = req.URL;

            const { exams, categories, ...comboBody } = body;

            const combo = await Combo.create({
                id_teacher,
                ...comboBody,
                // thumbnail,
                // cover
            }, {
                transaction: t
            });

            let examInstances = [];
            for (const exam of exams) {
                const e = await Exam.findByPk(exam);
                examInstances.push(e);
            }

            await combo.addExams(examInstances, { transaction: t });

            let categoryInstances = [];
            for (const category of categories) {
                const c = await Category.findByPk(category);
                categoryInstances.push(c);
            }
            await combo.addCategories(categoryInstances, { transaction: t });

            const Categories = categoryInstances.map(({ id, name }) => ({ id, name }));
            const user = { id: id_teacher, name: teacher_name };
            const comboDataValues = combo.dataValues;

            const algoliaDataToSave = {
                ...comboDataValues,
                user,
                Categories,
                objectID: combo.id
            };

            await t.commit();

            await index.saveObject(algoliaDataToSave);

            res.status(201).json(combo);
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ error: error.message });

            await t.rollback();
        }
    }

    uploadThumbnailAndCover = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            
            const dateTime = fileUpload.giveCurrentDateTime();

            if (!files.thumbnail[0].mimetype.startsWith('image/')) {
                return res.status(400).json({
                    message: "Invalid mimetype for thumbnail"
                });
            }

            if (!files.cover[0].mimetype.startsWith('image/')) {
                return res.status(400).json({
                    message: "Invalid mimetype for cover image"
                });
            }

            const thumbnailRef = ref(
                storage,
                `thumbnails combo exam/${files.thumbnail[0].originalname + '       ' + dateTime}`
            );
            const coverRef = ref(
                storage,
                `cover combo exam/${files.cover[0].originalname + '       ' + dateTime}`
            );

            // Create file metadata including the content type
            const metadataThumbnail = {
                contentType: files.thumbnail[0].mimetype,
            };
            const metadataCover = {
                contentType: files.cover[0].mimetype,
            };

            // Upload the file in the bucket storage
            const thumbnailSnapshot = await uploadBytesResumable(
                thumbnailRef,
                files.thumbnail[0].buffer,
                metadataThumbnail
            );

            const coverSnapshot = await uploadBytesResumable(
                coverRef,
                files.cover[0].buffer,
                metadataCover
            );

            // Grab the public url
            const thumbnailURL = await getDownloadURL(thumbnailSnapshot.ref);
            const coverURL = await getDownloadURL(coverSnapshot.ref);

            const URL = {
                thumbnail: thumbnailURL,
                cover: coverURL
            };

            req.URL = URL;

            next();
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ error });
        }
    }

    // [POST] /combos/:comboId/buy
    studentBuyCombo = async (req: Request, res: Response, _next: NextFunction) => {
        const t = await sequelize.transaction();
        try {
            const id_student = req.student.data.id;
            const id_combo = req.params.comboId;

            await StudentCombo.create({
                id_student,
                id_combo
            }, {
                transaction: t
            });

            const combo = await Combo.findByPk(id_combo);
            const total_registration = combo.total_registration + 1;
            await combo.update({
                total_registration
            }, {
                transaction: t
            });

            await t.commit()

            res.status(201).json({
                message: "Student has been bought the combo!"
            });
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ error: error.message });
        }
    }

    // [PUT] /combos/:comboId
    updateCombo = async (req: Request, res: Response, _next: NextFunction) => {
        const client = algoliasearch(process.env.ALGOLIA_APPLICATION_ID, process.env.ALGOLIA_ADMIN_API_KEY);
        const index = client.initIndex(process.env.ALGOLIA_COMBO_INDEX);

        const t = await sequelize.transaction();
        try {
            const id_combo = req.params.comboId;

            let data = req.body.data;
            if (typeof data === "string") {
                data = JSON.parse(data);
            }

            let { exams, categories, ...comboBody } = data;

            const combo = await Combo.findByPk(id_combo);

            const examsList: any[] = [];
            for (const exam of exams) {
                const examRecord = await Exam.findByPk(exam);
                examsList.push(examRecord);
            }
            await combo.setExams(examsList, { transaction: t });

            const categoriesList: any[] = [];
            for (const category of categories) {
                const categoryRecord = await Category.findByPk(category);
                if (!categoryRecord) throw new Error("Category does not exist");
                categoriesList.push(categoryRecord);
            }
            await combo.setCategories(categoriesList, { transaction: t });
            const Categories = categoriesList.map(({ id, name }) => ({ id, name }));

            await combo.update({
                ...comboBody
            }, {
                transaction: t
            });

            await t.commit();

            const algoliaDataToSave = {
                ...comboBody,
                objectID: combo.id,
                Categories
            };

            await index.partialUpdateObject(algoliaDataToSave);

            res.status(200).json(combo);
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ error: error.message });
        }
    }

    // [DELETE] /combos/:comboId
    deleteCombo = async (req: Request, res: Response, _next: NextFunction) => {
        const client = algoliasearch(process.env.ALGOLIA_APPLICATION_ID, process.env.ALGOLIA_ADMIN_API_KEY);
        const index = client.initIndex(process.env.ALGOLIA_COMBO_INDEX);

        const t = await sequelize.transaction();
        try {
            await Combo.destroy({
                where: {
                    id: req.params.comboId
                }
            }, {
                transaction: t
            });

            await t.commit();

            await index.deleteObject(req.params.comboId);

            res.status(200).json({
                message: "Successfully deleted combo",
                id: req.params.comboId
            });
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ error: error.message });

            await t.rollback();
        }
    }
}


module.exports = new ComboController();