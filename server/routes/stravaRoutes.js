const express = require('express');
const router = express.Router();
const stravaController = require('../controllers/stravaController');

router.get('/:id_ziak', stravaController.getStravaByStudentId);
router.delete('/:id_ziak', stravaController.deleteStravaByStudentId);
// Add a route for inserting strava records
router.post('/', stravaController.insertStrava);

module.exports = router;
