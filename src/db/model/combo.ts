const { sequelize } = require('../../config/db');
import { Model, DataTypes, CreationOptional } from 'sequelize';

const Exam = require('./exam');

class Combo extends Model {
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}


Combo.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    id_teacher: {
        type: DataTypes.UUID,
    },
    name: {
        type: DataTypes.STRING
    },
    price: {
        type: DataTypes.INTEGER.UNSIGNED,
        defaultValue: 0,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING
    },
    thumbnail: {
        type: DataTypes.TEXT
    },
    cover: {
        type: DataTypes.TEXT
    },
    average_rating: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        allowNull: false
    },
    total_review: {
        type: DataTypes.INTEGER.UNSIGNED,
        defaultValue: 0,
        allowNull: false
    },
    total_registration: {
        type: DataTypes.INTEGER.UNSIGNED,
        defaultValue: 0,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: "public"
    }
}, {
    sequelize,
    tableName: 'combo'
});

Combo.belongsToMany(Exam, {
    through: 'combo_exam',
    foreignKey: 'id_combo',
    otherKey: 'id_exam'
});
Exam.belongsToMany(Combo, {
    through: 'combo_exam',
    foreignKey: 'id_exam',
    otherKey: 'id_combo'
});

module.exports = Combo;
