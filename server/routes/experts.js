const express = require('express');
const router = express.Router();
const { getExperts, getExpertById, addExpert, updateExpert, deleteExpert } = require('../controllers/expertController');

router.get('/', getExperts);
router.get('/:id', getExpertById);
router.post('/', addExpert);
router.put('/:id', updateExpert);
router.delete('/:id', deleteExpert);

module.exports = router;
