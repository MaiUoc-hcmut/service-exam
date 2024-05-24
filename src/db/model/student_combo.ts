const { sequelize } = require('../../config/db');
import { Model, DataTypes, CreationOptional } from 'sequelize';

class StudentCombo extends Model {
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}


StudentCombo.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    id_student: {
        type: DataTypes.UUID,
    },
    id_combo: {
        type: DataTypes.UUID
    }
}, {
    sequelize,
    tableName: 'student_combo'
});


module.exports = StudentCombo;