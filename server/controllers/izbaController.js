const izbaService = require('../services/izbaService');

exports.getAll = async (req, res) => {
    try {
        const data = await izbaService.getAllRooms();
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.insert = async (req, res) => {
    try {
        const { cislo, kapacita } = req.body;
        const result = await izbaService.insertRoom(cislo, kapacita);
        res.status(201).json(result);
    } catch (err) {
        console.error('Error inserting room:', err);
        res.status(500).json({ message: err.message || 'Nepodarilo sa pridať izbu' });
    }
};

exports.remove = async (req, res) => {
    try {
        const { id_izba } = req.body;
        await izbaService.deleteRoom(id_izba);
        res.status(200).json({ message: 'Room deleted successfully' });
    } catch (err) {
        console.error(err);
        if (err.message.includes('Cannot delete room')) {
            res.status(400).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'Server error' });
        }
    }
};
