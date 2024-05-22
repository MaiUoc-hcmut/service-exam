const Exam = require('../../db/model/exam');
const Combo = require('../../db/model/combo');

const { sequelize } = require('../../config/db/index');
const axios = require('axios');

import { Request, Response, NextFunction } from "express";

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

    // [GET] /combos/:comboId
    getCombo = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const id_combo = req.params.comboId;
            const combo = await Combo.findByPk(id_combo, {
                include: [
                    {
                        model: Exam,
                        attributes: ['id', 'title', 'period', 'quantity_question'],
                        through: {
                            attributes: []
                        }
                    }
                ]
            });

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
                limit: pageSize,
                offset: pageSize * (currentPage - 1)
            });

            res.status(200).json({
                count,
                combos
            })
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ error: error.message });
        }
    }

    // [POST] /api/v1/combos
    createComboExam = async (req: Request, res: Response, _next: NextFunction) => {
        const t = await sequelize.transaction();
        try {
            const id_teacher = req.teacher.data.id;

            let body = req.body.data;
            if (typeof body === "string") {
                body = JSON.parse(body);
            }

            // const { thumbnail, cover } = req.URL;

            const { exams, ...comboBody } = body;

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

            await t.commit();

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

    // [POST] /combos/buy
    studentBuyCombo = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ error: error.message });
        }
    }

    // [PUT] /combos/:comboId
    updateCombo = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ error: error.message });
        }
    }

    // [DELETE] /combos/:comboId
    deleteCombo = async (req: Request, res: Response, _next: NextFunction) => {
        const t = await sequelize.transaction();
        try {
            await Combo.destroy({
                where: {
                    id: req.params.comboId
                }
            }, {
                transaction: t
            });

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