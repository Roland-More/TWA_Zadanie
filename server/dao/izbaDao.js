const { poolPromise, sql } = require('../config/db');

exports.getAll = async () => {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM izba');
    return result.recordset;
};

exports.insert = async (cislo, kapacita) => {
    const pool = await poolPromise;
    try {
        const result = await pool.request()
            .input('cislo', sql.Int, cislo)
            .input('kapacita', sql.Int, kapacita)
            .query(`
                INSERT INTO izba (cislo, kapacita, pocet_ubytovanych)
                OUTPUT INSERTED.id_izba
                VALUES (@cislo, @kapacita, 0)
            `);
        
        if (result.recordset.length === 0) {
            throw new Error('Izba nebola pridaná');
        }
        
        return { id_izba: result.recordset[0].id_izba };
    } catch (error) {
        console.error('Error in izbaDao.insert:', error);
        throw new Error(`Chyba pri pridávaní izby: ${error.message}`);
    }
};

exports.remove = async (id_izba) => {
    const pool = await poolPromise;
    
    // Check if room has students
    const checkResult = await pool.request()
        .input('id_izba', sql.Int, id_izba)
        .query('SELECT COUNT(*) as studentCount FROM ziak WHERE id_izba = @id_izba');
    
    if (checkResult.recordset[0].studentCount > 0) {
        throw new Error('Cannot delete room with assigned students');
    }
    
    await pool.request()
        .input('id_izba', sql.Int, id_izba)
        .query('DELETE FROM izba WHERE id_izba = @id_izba');
};

exports.getRoomById = async (id_izba) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('id_izba', sql.Int, id_izba)
        .query('SELECT * FROM izba WHERE id_izba = @id_izba');
    
    return result.recordset[0];
};
