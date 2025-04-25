const express = require('express');
const router = express.Router();
const izbaController = require('../controllers/izbaController');

router.get('/read', izbaController.getAll);
router.post('/insert', izbaController.insert);
router.delete('/delete', izbaController.remove);

module.exports = router;