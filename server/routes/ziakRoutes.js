const express = require('express');
const router = express.Router();
const ziakController = require('../controllers/ziakController');

router.get('/read', ziakController.getAll);
router.post('/insert', ziakController.insert);
router.delete('/delete', ziakController.remove);
router.get('/read/additional', ziakController.getAdditional);
router.put('/update-room', ziakController.updateRoom);

module.exports = router;
