const { sequelize } = require('../../config/db');
import { Model, DataTypes, CreationOptional } from 'sequelize';

class ExamDraft extends Model {
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

ExamDraft.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    id_exam: {
        type: DataTypes.UUID
    },
    id_question: {
        type: DataTypes.UUID
    },
    id_answer: {
        type: DataTypes.UUID
    },
    type: {
        type: DataTypes.STRING
    },
    order: {
        type: DataTypes.INTEGER
    },
    url: {
        type: DataTypes.TEXT
    },
}, {
    tableName: 'exam_draft',
    sequelize
});


module.exports = ExamDraft;