const { sql, poolPromise } = require('../config/db');

exports.getKartaByStudentId = async (id_ziak) => {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('id_ziak', sql.Int, id_ziak)
    .query(`
      SELECT id_karta, cislo, platnost_do, stav
      FROM karta
      WHERE id_ziak = @id_ziak
    `);
  return result.recordset;
};

exports.deleteKartaByStudentId = async (id_ziak) => {
  const pool = await poolPromise;
  await pool.request()
    .input('id_ziak', sql.Int, id_ziak)
    .query(`
      DELETE FROM karta
      WHERE id_ziak = @id_ziak
    `);
};

exports.insertKarta = async (id_ziak, cislo, platnost_do, stav = 'Aktívna') => {
  const pool = await poolPromise;
  await pool.request()
    .input('id_ziak', sql.Int, id_ziak)
    .input('cislo', sql.VarChar, cislo)
    .input('platnost_do', sql.Date, platnost_do)
    .input('stav', sql.VarChar, stav)
    .query(`
      INSERT INTO karta (id_ziak, cislo, platnost_do, stav)
      VALUES (@id_ziak, @cislo, @platnost_do, @stav)
    `);
};

exports.updateKartaStatus = async (id_karta, stav) => {
  const pool = await poolPromise;
  await pool.request()
    .input('id_karta', sql.Int, id_karta)
    .input('stav', sql.VarChar, stav)
    .query(`
      UPDATE karta
      SET stav = @stav
      WHERE id_karta = @id_karta
    `);
};
