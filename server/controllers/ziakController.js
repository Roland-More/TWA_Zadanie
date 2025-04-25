const ziakService = require('../services/ziakService');

exports.getAll = async (req, res) => {
  try {
    const result = await ziakService.getAll();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.insert = async (req, res) => {
  try {
    const result = await ziakService.insert(req.body);
    res.status(201).json(result);
  } catch (err) {
    console.error('Error inserting student:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const result = await ziakService.remove(req.body.id_ziak);
    res.status(result.status).json(result.message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAdditional = async (req, res) => {
  try {
    const data = await ziakService.getAdditional();
    res.json(data);
  } catch (err) {
    console.error("Chyba pri čítaní študentov:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const { id_ziak, id_izba } = req.body;
    const result = await ziakService.updateRoom(id_ziak, id_izba);
    res.json(result);
  } catch (err) {
    console.error('Error updating room:', err);
    res.status(500).json({ message: 'Chyba servera' });
  }
};
