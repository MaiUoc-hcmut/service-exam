const { sequelize } = require('../../config/db');
import { Model, DataTypes, CreationOptional } from 'sequelize';

const Question = require('./question');

class Error extends Model {
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

Error.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(30),
        allowNull: false,
    }

}, {
    sequelize,
    tableName: 'error',
});

Error.belongsToMany(Question, { through: 'report_error', foreignKey: 'id_error', otherKey: 'id_question' });
Question.belongsToMany(Error, { through: 'report_error', foreignKey: 'id_question', otherKey: 'id_error' });

module.exports = Error
