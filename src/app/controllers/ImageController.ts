const Question = require('../../db/model/question');
const Answer = require('../../db/model/answer');
const ExamDraft = require('../../db/model/exam_draft');

const { sequelize } = require('../../config/db/index');

const FileUpload = require('../../config/firebase/fileUpload');

import { Request, Response, NextFunction } from "express";

const { firebaseConfig } = require('../../config/firebase/firebase');
const {
    ref,
    getDownloadURL,
    uploadBytesResumable,
    getStorage,
} = require('firebase/storage');
const { initializeApp } = require('firebase/app');

initializeApp(firebaseConfig);
const storage = getStorage();


class ImageController {
    uploadSingleImage = async (req: Request, res: Response, _next: NextFunction) => {
        let body = req.body.data;

        if (typeof body === "string") {
            body = JSON.parse(body);
        }

        const t = await sequelize.transaction();
        try {
            const image = req.file;
            
            const { type, id_question, id_answer } = body;

            if (!image) {
                return res.status(400).json({
                    message: "Can not find file!"
                });
            }

            // Check type of file
            if (!image.mimetype.startsWith('image/')) {
                return res.status(400).json({
                    message: "Invalid mimetype for image of question!"
                });
            }

            let resUrl = "";

            const dateTime = FileUpload.giveCurrentDateTime();

            const storageRef = ref(
                storage,
                `image ${type}/${image?.originalname + '       ' + dateTime}`
            );

            // Create file metadata including the content type
            const metadata = {
                contentType: image?.mimetype,
            };

            // Upload the file in the bucket storage
            const snapshot = await uploadBytesResumable(
                storageRef,
                image?.buffer,
                metadata
            );

            // Grab the public url
            const downloadURL = await getDownloadURL(snapshot.ref);
            resUrl = downloadURL;


            if (type === "question") {
                console.log(type, resUrl)
                const question = await Question.findByPk(id_question);
            
                // If exam did not created yet, create a draft. Else, update the existed exam
                if (!question) {
                    await ExamDraft.create({
                        id_question,
                        type: "question",
                        url: resUrl,
                    });
                } else {
                    await Question.update({
                        content_image: resUrl
                    }, {
                        where: { id: id_question }
                    }, {
                        transaction: t
                    });
                }
            } else {
                const answer = await Answer.findByPk(id_answer);
            
                // If exam did not created yet, create a draft. Else, update the existed exam
                if (!answer) {
                    await ExamDraft.create({
                        id_answer,
                        type: "answer",
                        url: resUrl,
                    });
                } else {
                    await Answer.update({
                        content_image: resUrl
                    }, {
                        where: { id: id_answer }
                    }, {
                        transaction: t
                    });
                }
            }

            await t.commit();

            res.status(200).json({
                message: "Image has been uploaded cloud!",
                url: resUrl,
                type
            })
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ error });

            await t.rollback();
        }
    }
}

module.exports = new ImageController();