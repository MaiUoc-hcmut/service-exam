const { sequelize } = require('../../config/db');
import { Model, DataTypes } from 'sequelize';

const Exam = require('./exam');

class Review extends Model {}

Review.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        id_student: {
            type: DataTypes.UUID,
            allowNull: false
        },
        id_exam: DataTypes.UUID,
        content: DataTypes.STRING(1000),
        image: DataTypes.STRING(255),
        rating: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    }, {
        tableName: 'review',
        freezeTableName: true,
        sequelize
    }
);

Review.belongsTo(Exam, {
    foreignKey: 'id_exam'
});

Exam.hasMany(Review, {
    foreignKey: 'id_exam',
    as: 'ratings'
});
module.exports = Review;