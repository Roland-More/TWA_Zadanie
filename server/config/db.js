const sql = require('mssql');
require('dotenv').config();

const config = {
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
        enableArithAbort: true,
        trustServerCertificate: true,
    },
};

// Create a connection pool
const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Pripojenie k databáze úspešné');
        return pool;
    })
    .catch(err => {
        console.error('Chyba pripojenia k databáze:', err);
        throw err;
    });

module.exports = { sql, poolPromise };
