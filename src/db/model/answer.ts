const { sequelize } = require('../../config/db');
import { Model, DataTypes, CreationOptional } from 'sequelize';

class Answer extends Model {
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

Answer.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    id_question: {
        type: DataTypes.UUID,
    },
    is_correct: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    content_text: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    content_image: {
        type: DataTypes.STRING,
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'public',
        allowNull: false
    }
}, {
    sequelize,
    tableName: 'answer',
});

module.exports = Answer;
