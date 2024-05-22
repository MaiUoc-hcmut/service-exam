const Error = require('../../db/model/error');

const { sequelize } = require('../../config/db/index');
const axios = require('axios');

import { Request, Response, NextFunction } from "express";

require('dotenv').config();


class ErrorController {

    // [GET] /errors
    getAllErrorType = async (_req: Request, res: Response, _next: NextFunction) => {
        try {
            const errorsType = await Error.findAll();

            res.status(200).json(errorsType);
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ error, message: error.message });
        }
    }

    // [POST] /errors
    createErrorType = async (req: Request, res: Response, _next: NextFunction) => {
        const t = await sequelize.transaction();
        try {
            let body = req.body.data;
            if (typeof body === "string") {
                body = JSON.parse(body);
            }

            const errorTypes = await Error.bulkCreate(body, { transaction: t });

            await t.commit();

            res.status(201).json(errorTypes);
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ error, message: error.message });

            await t.rollback();
        }
    }
}

module.exports = new ErrorController();