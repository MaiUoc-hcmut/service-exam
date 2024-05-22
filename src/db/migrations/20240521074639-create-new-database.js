'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('par_category', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING(20),
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
    await queryInterface.createTable('category', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      id_par_category: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: 'par_category',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING(30),
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
    await queryInterface.createTable('exam', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      id_teacher: {
        allowNull: false,
        type: Sequelize.UUID,
      },
      id_course: {
        type: Sequelize.UUID,
      },
      title: {
        allowNull: false,
        type: Sequelize.STRING(150),
      },
      period: {
        allowNull: false,
        type: Sequelize.INTEGER.UNSIGNED,
      },
      quantity_question: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },
      quantity_assignment: {
        type: Sequelize.INTEGER.UNSIGNED,
      },
      total_review: {
        type: Sequelize.INTEGER.UNSIGNED,
      },
      average_rating: {
        type: Sequelize.FLOAT.UNSIGNED,
      },
      status: {
        type: Sequelize.STRING,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
    await queryInterface.createTable('question', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      id_exam: {
        type: Sequelize.UUID,
        references: {
          model: 'exam',
          key: 'id',
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      id_teacher: {
        allowNull: false,
        type: Sequelize.UUID,
      },
      content_text: {
        allowNull: false,
        type: Sequelize.TEXT,
      },
      content_image: {
        type: Sequelize.TEXT,
      },
      total_report: {
        type: Sequelize.INTEGER,
      },
      multi_choice: {
        type: Sequelize.BOOLEAN,
      },
      status: {
        type: Sequelize.STRING,
      },
      explain: {
        type: Sequelize.TEXT
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
    await queryInterface.createTable('save_question', {
      id_student: {
        allowNull: false,
        type: Sequelize.UUID,
      },
      id_question: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: 'question',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
    await queryInterface.createTable('assignment', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      id_student: {
        allowNull: false,
        type: Sequelize.UUID,
      },
      id_exam: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: 'exam',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      score: {
        allowNull: false,
        type: Sequelize.FLOAT,
      },
      passed: {
        type: Sequelize.BOOLEAN
      },
      right_question: {
        type: Sequelize.INTEGER.UNSIGNED
      },
      wrong_question: {
        type: Sequelize.INTEGER.UNSIGNED
      },
      empty_question: {
        type: Sequelize.INTEGER.UNSIGNED
      },
      time_start: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      time_end: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      comment: {
        type: Sequelize.TEXT
      },
      draft: {
        type: Sequelize.TEXT
      },
      reviewed: {
        type: Sequelize.INTEGER.UNSIGNED
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
    await queryInterface.createTable('answer', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      id_question: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: 'question',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      content_text: {
        allowNull: false,
        type: Sequelize.TEXT,
      },
      content_image: {
        type: Sequelize.TEXT,
      },
      is_correct: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      status: {
        type: Sequelize.STRING,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
    await queryInterface.createTable('detail_question', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
      },
      id_assignment: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: 'assignment',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      id_question: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: 'question',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      comment: {
        type: Sequelize.TEXT
      },
      draft: {
        type: Sequelize.TEXT
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
    await queryInterface.createTable('q&a', {
      id_student: {
        allowNull: false,
        type: Sequelize.UUID,
      },
      id_question: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: 'question',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      content_text: {
        allowNull: false,
        type: Sequelize.TEXT,
      },
      content_image: {
        type: Sequelize.TEXT,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
    await queryInterface.createTable('error', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING(40),
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
    await queryInterface.createTable('report_error', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      id_student: {
        allowNull: false,
        type: Sequelize.UUID,
      },
      id_question: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: 'question',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      id_error: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: 'error',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      content: {
        allowNull: false,
        type: Sequelize.TEXT,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
    await queryInterface.createTable('category-exam', {
      id_exam: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: 'exam',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      id_category: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: 'category',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
    await queryInterface.createTable('category-question', {
      id_question: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: 'question',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      id_category: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: 'category',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
    await queryInterface.createTable('selected_answer', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
      },
      id_detail_question: {
        type: Sequelize.UUID,
        references: {
          model: 'detail_question',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      id_answer: {
        type: Sequelize.UUID,
        references: {
          model: 'answer',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      is_selected: {
        type: Sequelize.BOOLEAN,
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
    await queryInterface.createTable('exam_draft', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true
      },
      id_exam: {
        type: Sequelize.UUID,
      },
      url: {
        type: Sequelize.TEXT,
      },
      order: {
        type: Sequelize.INTEGER
      },
      id_question: {
        type: Sequelize.UUID
      },
      id_answer: {
        type: Sequelize.UUID
      },
      type: {
        type: Sequelize.STRING
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
    await queryInterface.createTable('knowledge', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING
      }
    });
    await queryInterface.createTable('category-knowledge', {
      id_category: {
        type: Sequelize.UUID,
        references: {
          model: 'category',
          key: 'id',
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
      id_knowledge: {
        type: Sequelize.UUID,
        references: {
          model: 'knowledge',
          key: 'id',
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });
    await queryInterface.createTable('knowledge-question', {
      id_knowledge: {
        type: Sequelize.UUID,
        references: {
          model: 'knowledge',
          key: 'id',
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      id_question: {
        type: Sequelize.UUID,
        references: {
          model: 'question',
          key: 'id',
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
    await queryInterface.createTable('review', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
      },
      id_student: {
        type: Sequelize.UUID
      },
      id_exam: {
        type: Sequelize.UUID,
        references: {
          model: 'exam',
          key: 'id',
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
      content: {
        type: Sequelize.STRING(1000)
      },
      image: {
        type: Sequelize.TEXT
      },
      rating: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });
    await queryInterface.createTable('combo', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true
      },
      id_teacher: {
        type: Sequelize.UUID
      },
      name: {
        type: Sequelize.STRING
      },
      price: {
        type: Sequelize.INTEGER.UNSIGNED
      },
      description: {
        type: Sequelize.TEXT
      },
      thumbnail: {
        type: Sequelize.TEXT
      },
      cover: {
        type: Sequelize.TEXT
      },
      average_rating: {
        type: Sequelize.FLOAT
      },
      total_review: {
        type: Sequelize.INTEGER.UNSIGNED
      },
      total_registration: {
        type: Sequelize.INTEGER.UNSIGNED
      },
      status: {
        type: Sequelize.STRING
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });
    await queryInterface.createTable('combo_exam', {
      id_combo: {
        type: Sequelize.UUID,
        references: {
          model: 'combo',
          key: 'id'
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      id_exam: {
        type: Sequelize.UUID,
        references: {
          model: 'exam',
          key: 'id'
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });
    await queryInterface.createTable('coupon', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true
      },
      id_teacher: {
        type: Sequelize.UUID,
      },
      name: {
        type: Sequelize.STRING
      },
      percent: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },
      expire: {
        type: Sequelize.DATE,
        allowNull: false
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });
    await queryInterface.createTable('coupon_exam', {
      id_coupon: {
        type: Sequelize.UUID,
        references: {
          model: 'coupon',
          key: 'id',
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
      id_exan: {
        type: Sequelize.UUID,
        references: {
          model: 'exam',
          key: 'id',
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });
    await queryInterface.createTable('student_combo', {
      id_student: {
        type: Sequelize.UUID
      },
      id_combo: {
        type: Sequelize.UUID,
        references: {
          model: 'combo',
          key: 'id'
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('student_combo');
    await queryInterface.dropTable('coupon_exam');
    await queryInterface.dropTable('coupon');
    await queryInterface.dropTable('combo_exam');
    await queryInterface.dropTable('combo');
    await queryInterface.dropTable('review');
    await queryInterface.dropTable('knowledge-question');
    await queryInterface.dropTable('category-knowledge');
    await queryInterface.dropTable('knowledge');
    await queryInterface.dropTable('exam_draft');
    await queryInterface.dropTable('selected_answer');
    await queryInterface.dropTable('category-exam');
    await queryInterface.dropTable('category-question');
    await queryInterface.dropTable('category');
    await queryInterface.dropTable('par_category');
    await queryInterface.dropTable('detail_question');
    await queryInterface.dropTable('save_question');
    await queryInterface.dropTable('q&a');
    await queryInterface.dropTable('report_error');
    await queryInterface.dropTable('error');
    await queryInterface.dropTable('assignment');
    await queryInterface.dropTable('answer');
    await queryInterface.dropTable('question');
    await queryInterface.dropTable('exam');
  }
};
