const { sql, poolPromise } = require('../config/db');

exports.getStravaByStudentId = async (id_ziak) => {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('id_ziak', sql.Int, id_ziak)
    .query(`
      SELECT typ, zaciatok, koniec, stav
      FROM strava
      WHERE id_ziak = @id_ziak
    `);
  return result.recordset;
};

exports.deleteStravaByStudentId = async (id_ziak) => {
  const pool = await poolPromise;
  await pool.request()
    .input('id_ziak', sql.Int, id_ziak)
    .query(`
      DELETE FROM strava
      WHERE id_ziak = @id_ziak
    `);
};

// Add method to insert strava records
exports.insertStrava = async (id_ziak, typ, zaciatok, koniec, stav) => {
  const pool = await poolPromise;
  await pool.request()
    .input('id_ziak', sql.Int, id_ziak)
    .input('typ', sql.VarChar, typ)
    .input('zaciatok', sql.Date, zaciatok)
    .input('koniec', sql.Date, koniec)
    .input('stav', sql.VarChar, stav)
    .query(`
      INSERT INTO strava (id_ziak, typ, zaciatok, koniec, stav)
      VALUES (@id_ziak, @typ, @zaciatok, @koniec, @stav)
    `);
};
