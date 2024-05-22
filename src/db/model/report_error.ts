const { sequelize } = require('../../config/db');
import { Model, DataTypes, CreationOptional } from 'sequelize';


class ReportError extends Model {
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

ReportError.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    id_student: {
        type: DataTypes.UUID
    },
    id_question: {
        type: DataTypes.UUID
    },
    id_error: {
        type: DataTypes.UUID
    },
    content: {
        type: DataTypes.STRING(90),
        allowNull: false,
    }

}, {
    sequelize,
    tableName: 'report_error',
});


module.exports = ReportError;
