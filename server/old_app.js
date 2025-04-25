const express = require('express')
const app = express()
const port = 3000
const sql = require('mssql')
const cors = require('cors');

app.use(express.json());

app.use(cors({
    origin: ['http://localhost:3001']
}));

const config = {
    server: 'localhost',
    database: 'Internat',
    user: 'Zadanie',
    password: 'Romanzabijak.1',
    options: {
        enableArithAbort: true,
        trustServerCertificate: true,
    },
};

const connect = async (retries = 5, delay = 5000) => {
    for (let i = 0; i < retries; i++) {
        try {
            await sql.connect(config);
            console.log('Connected to the database');
            return;
        } catch (err) {
            console.error(`Database connection failed (attempt ${i + 1}): `, err);
            if (i < retries - 1) {
                console.log(`Retrying in ${delay / 1000} seconds...`);
                await new Promise(res => setTimeout(res, delay));
            } else {
                throw new Error(`Database connection failed after ${retries} attempts: ${err.message}`);
            }
        }
    }
};
connect()


app.get('/izba/read', async (req, res) => {
    try {
      await sql.connect(config);
      const result = await sql.query`SELECT * FROM izba`;
  
      res.json(result.recordset);
    } catch (err) {
      console.error('SQL error', err);
      res.status(500).send('Server error');
    }
});

app.post('/izba/insert', async (req, res) => {
    try {
        const { cislo, kapacita } = req.body;

        // Validacia
        if (cislo === undefined || kapacita === undefined) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        await sql.connect(config);
        const result = await sql.query`
        INSERT INTO izba (cislo, kapacita, pocet_ubytovanych)
        VALUES (${req.body.cislo}, ${req.body.kapacita}, 0)`;
  
        res.status(201).json({ message: 'Insert successful' });
    } catch (err) {
        console.error('SQL error', err);
        res.status(500).send('Server error');
    }
});

app.delete('/izba/delete', async (req, res) => {
    try {
        const { id_izba } = req.body;

        // Validacia
        if (id_izba === undefined) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        await sql.connect(config);
        const result = await sql.query`
        DELETE FROM izba
        WHERE id_izba = ${id_izba}`;
  
        res.status(201).json({ message: 'Delete successful' });
    } catch (err) {
        console.error('SQL error', err);
        res.status(500).send('Server error');
    }
});

app.get('/ziak/read', async (req, res) => {
    try {
      await sql.connect(config);
      const result = await sql.query`SELECT * FROM ziak`;
  
      res.json(result.recordset);
    } catch (err) {
      console.error('SQL error', err);
      res.status(500).send('Server error');
    }
});

app.post('/ziak/insert', async (req, res) => {
    try {
        const { meno, priezvisko, datum_narodenia, email, ulica, mesto, PSC, id_izba } = req.body;

        // Validácia
        if (!meno || !priezvisko || !datum_narodenia || !email || !ulica || !mesto || !PSC || !id_izba) {
            return res.status(400).json({ message: 'Chýbajúce povinné údaje.' });
        }

        await sql.connect(config);

        // 1. Skontroluj kapacitu izby
        const checkResult = await sql.query`
            SELECT kapacita, pocet_ubytovanych FROM izba WHERE id_izba = ${id_izba}
        `;

        if (checkResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Izba neexistuje.' });
        }

        const { kapacita, pocet_ubytovanych } = checkResult.recordset[0];

        if (pocet_ubytovanych >= kapacita) {
            return res.status(400).json({ message: 'Izba je plne obsadená.' });
        }

        // 2. Vlož študenta
        await sql.query`
            INSERT INTO ziak (meno, priezvisko, datum_narodenia, email, ulica, mesto, PSC, id_izba)
            VALUES (${meno}, ${priezvisko}, ${datum_narodenia}, ${email}, ${ulica}, ${mesto}, ${PSC}, ${id_izba})
        `;

        res.status(201).json({ message: 'Študent úspešne pridaný.' });

    } catch (err) {
        console.error('SQL chyba:', err);
        res.status(500).send('Chyba servera.');
    }
});

app.delete('/ziak/delete', async (req, res) => {
    try {
        const { id_ziak } = req.body;

        // Validacia
        if (id_ziak === undefined) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        await sql.connect(config);
        const result = await sql.query`
        DELETE FROM ziak
        WHERE id_ziak = ${id_ziak}`;
  
        res.status(201).json({ message: 'Delete successful' });
    } catch (err) {
        console.error('SQL error', err);
        res.status(500).send('Server error');
    }
});

app.get('/ziak/read/additional', async (req, res) => {
    try {
        const baseQuery = `
            SELECT 
            z.id_ziak, z.meno, z.priezvisko, z.datum_narodenia, z.email,
            i.cislo AS izba_cislo,
            k.cislo AS karta_cislo, k.platnost_do AS karta_platnost_do, k.stav AS karta_stav
            FROM ziak z
            LEFT JOIN izba i ON z.id_izba = i.id_izba
            OUTER APPLY (
            SELECT TOP 1 * FROM karta
            WHERE id_ziak = z.id_ziak
            ORDER BY platnost_do DESC
            ) k
        `;

        const students = await pool.request().query(baseQuery);
        const studentData = students.recordset;

        // Fetch strava plans for all students
        const stravaQuery = `
            SELECT id_ziak, typ, zaciatok, koniec, stav
            FROM strava
        `;
        const stravaResult = await pool.request().query(stravaQuery);
        const stravaMap = {};

        stravaResult.recordset.forEach(s => {
            if (!stravaMap[s.id_ziak]) stravaMap[s.id_ziak] = [];
            stravaMap[s.id_ziak].push({
                typ: s.typ,
                zaciatok: s.zaciatok,
                koniec: s.koniec,
                stav: s.stav
            });
        });

        // Merge strava into each student
        const enriched = studentData.map(st => ({
            id_ziak: st.id_ziak,
            meno: st.meno,
            priezvisko: st.priezvisko,
            datum_narodenia: st.datum_narodenia,
            email: st.email,
            izba: st.izba_cislo ? { cislo: st.izba_cislo } : null,
            karta: st.karta_cislo ? {
            cislo: st.karta_cislo,
            platnost_do: st.karta_platnost_do,
            stav: st.karta_stav
            } : null,
            strava: stravaMap[st.id_ziak] || []
        }));

        res.json(enriched);
    } catch (err) {
        console.error("Chyba pri čítaní študentov:", err);
        res.status(500).json({ error: "Server error" });
    }
});

app.put('/ziak/update-room', async (req, res) => {
    const { id_ziak, id_izba } = req.body;

    if (!id_ziak || !id_izba) {
        return res.status(400).json({ message: 'Chýbajúce údaje.' });
    }

    try {
        await sql.connect(config);
        const result = await sql.query`
        UPDATE ziak
        SET id_izba = ${id_izba}
        WHERE id_ziak = ${id_ziak}
        `;
        res.status(200).json({ message: 'Izba bola zmenená.' });
    } catch (err) {
        console.error('Chyba pri aktualizácii izby:', err);
        res.status(500).json({ message: 'Chyba servera.' });
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});
