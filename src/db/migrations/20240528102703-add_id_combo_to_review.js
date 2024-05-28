'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('review', 'id_combo', {
      type: Sequelize.UUID,
      references: {
        model: 'combo',
        key: 'id'
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('review', 'id_combo');
  }
};
