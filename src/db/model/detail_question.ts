const { sequelize } = require('../../config/db');
import { Model, DataTypes, CreationOptional } from 'sequelize';

const Answer = require('./answer');

class DetailQuestion extends Model {
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

DetailQuestion.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    id_assignment: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    id_question: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    comment: {
        type: DataTypes.STRING(300),
        defaultValue: ""
    },
    draft: {
        type: DataTypes.STRING,
        defaultValue: ""
    }
}, {
    sequelize,
    tableName: 'detail_question',
});

DetailQuestion.belongsToMany(Answer, {
    through: 'selected_answer',
    foreignKey: 'id_detail_question',
    otherKey: 'id_answer'
});

Answer.belongsToMany(DetailQuestion, {
    through: 'selected_answer',
    foreignKey: 'id_answer',
    otherKey: 'id_detail_question'
});

module.exports = DetailQuestion;