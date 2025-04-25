const express = require('express');
const router = express.Router();
const kartaController = require('../controllers/kartaController');

router.get('/:id_ziak', kartaController.getKartaByStudentId);
router.delete('/:id_ziak', kartaController.deleteKartaByStudentId);
router.post('/', kartaController.insertKarta);
router.put('/status', kartaController.updateKartaStatus);

module.exports = router;
