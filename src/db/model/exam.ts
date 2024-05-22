const { sequelize } = require('../../config/db');
import { Model, DataTypes, CreationOptional } from 'sequelize';
const Question = require('./question');
const Category = require('./category');
const Assignment = require('./assignment');

class Exam extends Model {
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

Exam.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    id_teacher: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    id_course: {
        type: DataTypes.UUID,
    },
    title: {
        type: DataTypes.STRING(150),
        allowNull: false,
    },
    period: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
    quantity_question: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    pass_score: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "public",
    },
    quantity_assignment: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    total_review: {
        type: DataTypes.INTEGER.UNSIGNED,
        defaultValue: 0,
        allowNull: false
    },
    average_rating: {
        type: DataTypes.NUMBER,
        defaultValue: 0,
        allowNull: false
    }
}, {
    sequelize,
    tableName: 'exam',
});

Exam.hasMany(Question, { foreignKey: 'id_exam', as: 'questions' });
Question.belongsTo(Exam, { foreignKey: 'id_exam' });

Exam.belongsToMany(Category, { through: 'category-exam', foreignKey: 'id_exam', otherKey: 'id_category' });
Category.belongsToMany(Exam, { through: 'category-exam', foreignKey: 'id_category', otherKey: 'id_exam' });

Exam.hasMany(Assignment, { foreignKey: 'id_exam', as: 'assignments' });
Assignment.belongsTo(Exam, { foreignKey: 'id_exam' });

module.exports = Exam;
