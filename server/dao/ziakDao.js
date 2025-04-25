const { poolPromise, sql } = require('../config/db');

exports.getAll = async () => {
  const pool = await poolPromise;
  const result = await pool.request().query('SELECT * FROM ziak');
  return result.recordset;
};

exports.insert = async (studentData) => {
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const result = await transaction.request()
      .input('meno', sql.NVarChar, studentData.meno)
      .input('priezvisko', sql.NVarChar, studentData.priezvisko)
      .input('datum_narodenia', sql.Date, new Date(studentData.datum_narodenia))
      .input('email', sql.NVarChar, studentData.email)
      .input('ulica', sql.NVarChar, studentData.ulica)
      .input('mesto', sql.NVarChar, studentData.mesto)
      .input('PSC', sql.NVarChar, studentData.PSC)
      .input('id_izba', sql.Int, studentData.id_izba)
      .query(`
        INSERT INTO ziak (meno, priezvisko, datum_narodenia, email, ulica, mesto, PSC, id_izba)
        VALUES (@meno, @priezvisko, @datum_narodenia, @email, @ulica, @mesto, @PSC, @id_izba);
        SELECT SCOPE_IDENTITY() AS id_ziak;
      `);

    await transaction.commit();
    return result.recordset[0];
  } catch (error) {
    await transaction.rollback();
    console.error('Error in ziakDao.insert:', error);
    throw error;
  }
};

exports.remove = async (id_ziak) => {
  const pool = await poolPromise;
  
  // Begin transaction
  const transaction = new sql.Transaction(pool);
  await transaction.begin();
  
  try {
    // Delete related records
    await transaction.request()
      .input('id_ziak', sql.Int, id_ziak)
      .query('DELETE FROM karta WHERE id_ziak = @id_ziak');
    
    await transaction.request()
      .input('id_ziak', sql.Int, id_ziak)
      .query('DELETE FROM strava WHERE id_ziak = @id_ziak');
    
    // Delete the student
    await transaction.request()
      .input('id_ziak', sql.Int, id_ziak)
      .query('DELETE FROM ziak WHERE id_ziak = @id_ziak');
    
    await transaction.commit();
    return { success: true };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

exports.updateRoom = async (id_ziak, id_izba) => {
  const pool = await poolPromise;
  try {
    const result = await pool.request()
      .input('id_ziak', sql.Int, id_ziak)
      .input('id_izba', sql.Int, id_izba)
      .query('UPDATE ziak SET id_izba = @id_izba WHERE id_ziak = @id_ziak');
    
    if (result.rowsAffected[0] === 0) {
      throw new Error('Študent s daným ID nebol nájdený');
    }
    
    return result;
  } catch (error) {
    console.error('Error in ziakDao.updateRoom:', error);
    throw error;
  }
};
