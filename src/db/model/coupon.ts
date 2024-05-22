const { sequelize } = require('../../config/db');
import { Model, DataTypes, CreationOptional } from 'sequelize';

const Exam = require('./exam');

class Coupon extends Model {
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

Coupon.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    id_teacher: {
        type: DataTypes.UUID
    },
    name: {
        type: DataTypes.STRING
    },
    percent: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
    start_time: {
        type: DataTypes.DATE,
        allowNull: false
    },
    expire: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    sequelize,
    tableName: 'coupon'
});

Coupon.belongsToMany(Exam, {
    through: 'coupon_exam',
    foreignKey: 'id_coupon',
    otherKey: 'id_exam'
});
Exam.belongsToMany(Coupon, {
    through: 'coupon_exam',
    foreignKey: 'id_exam',
    otherKey: 'id_coupon'
});

module.exports = Coupon;