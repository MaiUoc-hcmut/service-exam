const Knowledge = require('../../db/model/knowledge');
const Category = require('../../db/model/category');
const ParentCategory = require('../../db/model/par_category');

const { sequelize } = require('../../config/db/index');

const { Op } = require('sequelize');

import { Request, Response, NextFunction } from "express";

require('dotenv').config();


class KnowledgeController {

    // [GET] /knowledges
    getAllKnowledges = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const knowledges = await Knowledge.findAll({
                include: [{
                    model: Category,
                    attributes: ['id', 'id_par_category', 'name'],
                    through: {
                        attributes: []
                    }
                }]
            });

            for (const knowledge of knowledges) {
                for (const category of knowledge.Categories) {
                    const parCategory = await ParentCategory.findByPk(category.id_par_category);
                    category.dataValues[`${parCategory.name}`] = category.name;
                    delete category.dataValues.name;
                    delete category.dataValues.id_par_category;
                    delete category.dataValues.createdAt;
                    delete category.dataValues.updatedAt;
                }
            }

            res.status(200).json(knowledges);
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ error: error.message });
        }
    }

    // [POST] /knowledges
    createKnowledges = async (req: Request, res: Response, _next: NextFunction) => {
        let body = req.body.data;
        if (typeof body === "string") {
            body = JSON.parse(body);
        }

        const t = await sequelize.transaction();
        try {
            let knowledges = [];
            for (const knowledge of body) {
                const { name, categories } = knowledge;

                if (categories === undefined || categories.length === 0) {
                    return res.status(400).json({
                        message: "Categories missed!"
                    });
                }

                let categoriesInstance = [];
                for (const id of categories) {
                    const category = await Category.findByPk(id);

                    if (!category) {
                        return res.status(400).json({
                            message: "Category does not exist!",
                            category: id
                        });
                    }
                    categoriesInstance.push(category);
                }

                const newKnowledge = await Knowledge.create({ name }, { transaction: t });
                await newKnowledge.addCategories(categoriesInstance, { transaction: t });
                knowledges.push(newKnowledge);
            }

            await t.commit();
            res.status(201).json(knowledges);
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ error: error.message });
            await t.rollback();
        }
    }

    // [GET] /knowledges/filter
    getKnowledgeByFilter = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const categories = Object.values(req.query);
            console.log(categories);
            const knowledges = await Knowledge.findAll({
                include: [
                    {
                        model: Category,
                        where: {
                            id: {
                                [Op.in]: categories,
                            },
                        },
                        required: true,
                        attributes: [],
                        through: {
                            attributes: []
                        }
                    }
                ],
                attributes: ['id', 'name'],
                through: {
                    attributes: []
                },
                group: ['Knowledge.id'],
                having: sequelize.literal("COUNT(DISTINCT "+`Categories`+"."+`id`+`) = ${categories.length}`)
            });

            res.status(200).json(knowledges);

        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ error: error.message });
        }
    }

    // [DElETE] /knowledges/:knowledgeId
    deleteSingleKnowledge = async (req: Request, res: Response, _next: NextFunction) => {
        const t = await sequelize.transaction();
        try {
            const id_knowledge = req.params.knowledgeId;

            await Knowledge.destroy({
                where: { id: id_knowledge }
            }, {
                transaction: t
            });

            await t.commit();

            res.status(200).json({
                message: "Knowledge has been deleted!",
                knowledge: id_knowledge
            });
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ error: error.message });

            await t.rollback();
        }
    }
}

module.exports = new KnowledgeController();