const kartaService = require('../services/kartaService');

exports.getKartaByStudentId = async (req, res) => {
  try {
    const { id_ziak } = req.params;
    const data = await kartaService.getKartaByStudentId(id_ziak);
    res.json(data);
  } catch (err) {
    console.error('Chyba pri získavaní karty:', err);
    if (err.message.includes('required')) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Chyba servera' });
    }
  }
};

exports.deleteKartaByStudentId = async (req, res) => {
  try {
    const { id_ziak } = req.params;
    await kartaService.deleteKartaByStudentId(id_ziak);
    res.json({ message: 'Karta úspešne odstránená.' });
  } catch (err) {
    console.error('Chyba pri mazaní karty:', err);
    if (err.message.includes('required')) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Chyba servera' });
    }
  }
};

exports.insertKarta = async (req, res) => {
  try {
    await kartaService.insertKarta(req.body);
    res.status(201).json({ message: 'Karta úspešne pridaná' });
  } catch (err) {
    console.error('Chyba pri vytváraní karty:', err);
    if (err.message.includes('povinné') || err.message.includes('budúcnosti')) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Chyba servera' });
    }
  }
};

exports.updateKartaStatus = async (req, res) => {
  try {
    const { id_karta, stav } = req.body;
    await kartaService.updateKartaStatus(id_karta, stav);
    res.json({ message: 'Stav karty úspešne aktualizovaný' });
  } catch (err) {
    console.error('Chyba pri aktualizácii karty:', err);
    if (err.message.includes('povinné') || err.message.includes('Neplatný')) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Chyba servera' });
    }
  }
};
