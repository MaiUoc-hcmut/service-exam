const { sequelize } = require('../../config/db');
import { Model, DataTypes, CreationOptional } from 'sequelize';

class SelectedAnswer extends Model {
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}


SelectedAnswer.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    id_detail_question: {
        type: DataTypes.UUID,
        allowNull: false
    },
    id_answer: {
        type: DataTypes.UUID,
        allowNull: false
    },
    is_selected: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    }
}, {
    sequelize,
    tableName: 'selected_answer',
    timestamps: false
});

module.exports = SelectedAnswer;