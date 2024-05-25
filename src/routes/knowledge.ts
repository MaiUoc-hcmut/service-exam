const express = require('express');
const router = express.Router();

const KnowledgeController = require('../app/controllers/KnowledgeController');

router.route('/')
    .get(KnowledgeController.getAllKnowledges)
    .post(KnowledgeController.createKnowledges);

router.route('/filter')
    .get(KnowledgeController.getKnowledgeByFilter);

router.route('/:knowledgesId')
    .delete(KnowledgeController.deleteSingleKnowledge);

module.exports = router;

export {}