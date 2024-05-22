const { sequelize } = require('../../config/db');
import { Model, DataTypes, CreationOptional } from 'sequelize';

const Category = require('./category');
const Answer = require('./answer');
const Knowledge = require('./knowledge');

class Question extends Model {
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

Question.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    id_teacher: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    id_exam: {
        type: DataTypes.UUID,
    },
    content_text: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    content_image: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    total_report: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
    },
    multi_choice: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'public',
        allowNull: false
    },
    explain: {
        type: DataTypes.TEXT
    }
}, {
    sequelize,
    tableName: 'question',
});

Question.hasMany(Answer, { foreignKey: 'id_question', as: 'answers' });
Answer.belongsTo(Question, { foreignKey: 'id_question' });

Question.belongsToMany(Category, {
    through: 'category-question',
    foreignKey: 'id_question',
    otherKey: 'id_category'
});

Category.belongsToMany(Question, {
    through: 'category-question',
    foreignKey: 'id_category',
    otherKey: 'id_question'
});


Question.belongsToMany(Knowledge, {
    through: 'knowledge-question',
    foreignKey: 'id_question',
    otherKey: 'id_knowledge'
});

Knowledge.belongsToMany(Question, {
    through: 'knowledge-question',
    foreignKey: 'id_knowledge',
    otherKey: 'id_question'
});

module.exports = Question;
