const stravaService = require('../services/stravaService');

exports.getStravaByStudentId = async (req, res) => {
  try {
    const { id_ziak } = req.params;
    const data = await stravaService.getStravaByStudentId(id_ziak);
    res.json(data);
  } catch (err) {
    console.error('Chyba pri získavaní stravy:', err);
    if (err.message.includes('required')) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Chyba servera' });
    }
  }
};

exports.deleteStravaByStudentId = async (req, res) => {
  try {
    const { id_ziak } = req.params;
    await stravaService.deleteStravaByStudentId(id_ziak);
    res.json({ message: 'Strava úspešne odstránená.' });
  } catch (err) {
    console.error('Chyba pri mazaní stravy:', err);
    if (err.message.includes('required')) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Chyba servera' });
    }
  }
};

exports.insertStrava = async (req, res) => {
  try {
    await stravaService.insertStrava(req.body);
    res.status(201).json({ message: 'Strava úspešne pridaná' });
  } catch (err) {
    console.error('Chyba pri vytváraní stravy:', err);
    if (err.message.includes('required') || err.message.includes('must be before')) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Chyba servera' });
    }
  }
};
