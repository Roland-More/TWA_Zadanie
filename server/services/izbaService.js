const izbaDao = require('../dao/izbaDao');

exports.getAllRooms = async () => {
    return await izbaDao.getAll();
};

exports.insertRoom = async (cislo, kapacita) => {
    try {
        if (!cislo || !kapacita) {
            throw new Error('Číslo izby a kapacita sú povinné polia');
        }
        
        const result = await izbaDao.insert(cislo, kapacita);
        return { success: true, message: 'Izba úspešne pridaná', id_izba: result.id_izba };
    } catch (error) {
        console.error('Error in izbaService.insertRoom:', error);
        throw error;
    }
};

exports.deleteRoom = async (id_izba) => {
    if (!id_izba) {
        throw new Error('Room ID is required');
    }
    
    try {
        return await izbaDao.remove(id_izba);
    } catch (error) {
        if (error.message.includes('Cannot delete room')) {
            throw error; // Rethrow business logic errors
        }
        throw new Error('Failed to delete room: ' + error.message);
    }
};
