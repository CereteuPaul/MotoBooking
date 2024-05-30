const express = require('express');
const sql = require('mssql');
const path = require('path');
const jwt = require('jsonwebtoken');
const secretKey = 'secret';

const app = express();
const port = 3000; // Use the port specified in the environment variable, or default to port 3000

const connection2 = {
    user: 'paulcereteu',
    password: '1234',
    server: "DESKTOP-42OITI9",
    database: 'MotorcycleCircuit',
    options: {
        trustServerCertificate: true // For development purposes only
    }
};

sql.connect(connection2)
    .then(pool => {
        console.log('Connected to SQL Server database');
        // return pool.request().query('SELECT * FROM Circuit');
    })
    .then(result => {
        console.log("MOTORCYCLE", result);
    })
    .catch(err => {
        console.error('Error connecting to SQL Server database:', err);
    });

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const pool = await sql.connect(connection2);
        const result = await pool.request()
            .input('email', sql.VarChar, email)
            .input('password', sql.VarChar, password)
            .query('SELECT * FROM Admins WHERE email = @email AND password = @password');

        if (result.recordset.length > 0) {
            const user = result.recordset[0];
            const payload = {
                email,
                role: user.role,
            }
            const token = jwt.sign(payload, secretKey, {expiresIn: "24h"});
            res.status(200).json({token, role: user.role})
        } else {
            res.status(401).send('Invalid email or password');
        }
    } catch (error) {
        console.error('Error executing SQL query:', error);
        res.status(500).send('An error occurred while processing your request');
    }
});

app.get('/circuits', async (req, res) => {
    try {
        // Create a SQL query to fetch circuits data from the database
        const query = 'SELECT * FROM Circuit';

        // Execute the query
        const pool = await sql.connect(connection2);
        const result = await pool.request().query(query);

        // Send the fetched circuits data as a JSON response
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching circuits:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/reservations', async (req, res) => {
    try {
        const query = 'SELECT * FROM Reservations';

        const pool = await sql.connect(connection2);
        const result = await pool.request().query(query);

        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching reservations:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/users', async (req, res) => {
    try {
        const query = 'SELECT * FROM Admins';

        const pool = await sql.connect(connection2);
        const result = await pool.request().query(query);

        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching reservations:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    jwt.verify(token, secretKey, (err, user) => {
        console.log('user', user);
        if (err) {
            return res.status(403).json({ message: 'Invalid token.' });
        }

        req.user = user;
        next();
    });
}

app.delete('/users/:adminId', async (req, res) => {
    const adminId = req.params.adminId;
    try {
        // Execute SQL query to delete the admin with the specified ID
        const pool = await sql.connect(connection2);
        const result = await pool.request()
            .input('adminId', sql.Int, adminId)
            .query('DELETE FROM Admins WHERE admin_id = @adminId');

        if (result.rowsAffected > 0) {
            res.status(200).send(`Admin with ID ${adminId} deleted successfully`);
        } else {
            res.status(404).send(`Admin with ID ${adminId} not found`);
        }
    } catch (error) {
        console.error('Error deleting admin:', error);
        res.status(500).send('An error occurred while processing your request');
    }
});

app.put('/users/:adminId', async (req, res) => {
    const adminId = req.params.adminId;
    const { role } = req.body;
    try {
        // Execute SQL query to update the role of the admin with the specified ID
        const pool = await sql.connect(connection2);
        const result = await pool.request()
            .input('role', sql.VarChar, role)
            .input('adminId', sql.Int, adminId)
            .query('UPDATE Admins SET role = @role WHERE admin_id = @adminId');

        if (result.rowsAffected > 0) {
            res.status(200).send(`Role for admin with ID ${adminId} updated successfully`);
        } else {
            res.status(404).send(`Admin with ID ${adminId} not found`);
        }
    } catch (error) {
        console.error('Error updating role:', error);
        res.status(500).send('An error occurred while processing your request');
    }
});

app.put('/circuits/:circuitId', async (req, res) => {
    const circuitId = req.params.circuitId;
    const { NextRaceDate } = req.body;
    try {
        // Execute SQL query to update the next race date of the circuit with the specified ID
        const pool = await sql.connect(connection2);
        const result = await pool.request()
            .input('NextRaceDate', sql.Date, NextRaceDate)
            .input('CircuitID', sql.Int, circuitId)
            .query('UPDATE Circuit SET NextRaceDate = @NextRaceDate WHERE CircuitID = @CircuitID');

        if (result.rowsAffected > 0) {
            res.status(200).send(`Next race date for circuit with ID ${circuitId} updated successfully`);
        } else {
            res.status(404).send(`Circuit with ID ${circuitId} not found`);
        }
    } catch (error) {
        console.error('Error updating next race date:', error);
        res.status(500).send('An error occurred while processing your request');
    }
});

app.put('/reservations/:email', async (req, res) => {
    const email = req.params.email;
    const { CircuitID } = req.body;

    try {
        const pool = await sql.connect(connection2);
        const result = await pool.request()
            .input('Email', sql.VarChar, email)
            .input('CircuitID', sql.Int, CircuitID)
            .query('UPDATE Reservations SET CircuitID = @CircuitID WHERE Email = @Email');

        if (result.rowsAffected > 0) {
            res.status(200).send(`Reservation for ${email} updated successfully`);
        } else {
            res.status(404).send(`Reservation for ${email} not found`);
        }
    } catch (error) {
        console.error('Error updating reservation:', error);
        res.status(500).send('An error occurred while processing your request');
    }
});

app.delete('/circuits/:circuitId', async (req, res) => {
    const circuitId = req.params.circuitId;
    try {
        // Execute SQL query to delete the circuit with the specified ID
        const pool = await sql.connect(connection2);
        const result = await pool.request()
            .input('CircuitID', sql.Int, circuitId)
            .query('DELETE FROM Circuit WHERE CircuitID = @CircuitID');

        if (result.rowsAffected > 0) {
            res.status(200).send(`Circuit with ID ${circuitId} deleted successfully`);
        } else {
            res.status(404).send(`Circuit with ID ${circuitId} not found`);
        }
    } catch (error) {
        console.error('Error deleting circuit:', error);
        res.status(500).send('An error occurred while processing your request');
    }
});

app.delete('/reservations/:RiderNumber', async (req, res) => {
    const RiderNumber = req.params.RiderNumber;
    try {
        const pool = await sql.connect(connection2);
        const result = await pool.request()
            .input('RiderNumber', sql.Int, RiderNumber)
            .query('DELETE FROM Reservations WHERE RiderNumber = @RiderNumber');

        if (result.rowsAffected > 0) {
            res.status(200).send(`Reservation for ${RiderNumber} deleted successfully`);
        } else {
            res.status(404).send(`Reservation for ${RiderNumber} not found`);
        }
    } catch (error) {
        console.error('Error deleting reservation:', error);
        res.status(500).send('An error occurred while processing your request');
    }
});

app.use('/protected-route', authenticateToken, (req, res) => {
    console.log('res', res);
    res.json({ message: 'This is a protected route.' });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/users-perspective', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'users-perspective.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/circuits-page', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'circuits.html'));
});

app.get('/circuit-info/:circuitId', async (req, res) => {
    const circuitId = req.params.circuitId;

    if (!circuitId) {
        return res.status(400).json({ error: 'Circuit ID is missing in the request' });
    }

    console.log('Received circuitId:', circuitId);

    try {
        const pool = await sql.connect(connection2);
        const result = await pool.request()
            .input('circuitId', sql.Int, circuitId)
            .query(`
                SELECT 
                    t.Weather, 
                    t.Conditions, 
                    pl.PitSpeedLimit, 
                    m.Groups, 
                    m.Count,
                    c.CircuitName,
                    c.Country,
                    c.Length,
                    c.CircuitPhoto
                FROM 
                    Track t
                INNER JOIN 
                    Circuit c ON t.CircuitID = c.CircuitID
                INNER JOIN 
                    PitLane pl ON c.CircuitID = pl.CircuitID
                INNER JOIN 
                    Marshalls m ON c.CircuitID = m.CircuitID
                WHERE 
                    c.CircuitID = @circuitId
            `);

        if (result.recordset.length > 0) {
            res.json({ circuitId: circuitId, ...result.recordset[0] });
        } else {
            res.status(404).send('Circuit details not found');
        }
    } catch (error) {
        console.error('Error fetching circuit info:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/reservation-info/:circuitId', async (req, res) => {
    const circuitId = req.params.circuitId;

    if (!circuitId) {
        return res.status(400).json({ error: 'Circuit ID is missing in the request' });
    }

    console.log('Received circuitId:', circuitId);

    try {
        const pool = await sql.connect(connection2);
        const result = await pool.request()
            .input('circuitId', sql.Int, circuitId)
            .query(`
                SELECT 
                    c.CircuitName,
                    c.Country 
                FROM 
                    Circuit c
                WHERE 
                    c.CircuitID = @circuitId
            `);

        if (result.recordset.length > 0) {
            res.json({ circuitId: circuitId, ...result.recordset[0] });
        } else {
            res.status(404).send('Circuit details not found');
        }
    } catch (error) {
        console.error('Error fetching circuit info:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/reservations-page', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'reservations.html'));
});

app.get('/users-page', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admins.html'));
});

app.get('/my-reservations', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'my-reservations.html'));
});

app.get('/sign-up-page', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'sign-up-page.html'));
});

app.get('/book-now-page', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'book-now-page.html'));
});

app.post('/circuits', async (req, res) => {
    const { CircuitName, Country, CircuitPhoto, Length, NextRaceDate } = req.body;
    try {
        const pool = await sql.connect(connection2);
        const result = await pool.request()
            .input('CircuitName', sql.VarChar, CircuitName)
            .input('Country', sql.VarChar, Country)
            .input('CircuitPhoto', sql.VarChar, CircuitPhoto)
            .input('Length', sql.Float, Length)
            .input('NextRaceDate', sql.Date, NextRaceDate)
            .query('INSERT INTO Circuit (CircuitName, Country, CircuitPhoto, Length, NextRaceDate) VALUES (@CircuitName, @Country, @CircuitPhoto, @Length, @NextRaceDate)');

        res.status(201).send('Circuit added successfully');
    } catch (error) {
        console.error('Error adding circuit to database:', error);
        res.status(500).send('An error occurred while processing your request');
    }
});

app.post('/book-now', async (req, res) => {
    const {FirstName, LastName, PhoneNumber, Email, RiderNumber, Date, CircuitID } = req.body;
    try {
        const pool = await sql.connect(connection2);

        const checkResult = await pool.request()
            .input('RiderNumber', sql.Int, RiderNumber)
            .query('SELECT COUNT(*) as count FROM Reservations WHERE RiderNumber = @RiderNumber');

        const count = checkResult.recordset[0].count;

        if (count > 0) {
            return res.status(400).json({message: 'Rider number already exists. Please enter another rider number.'});
        }


        const result = await pool.request()
            .input('FirstName', sql.VarChar, FirstName)
            .input('LastName', sql.VarChar, LastName)
            .input('PhoneNumber', sql.VarChar, PhoneNumber)
            .input('Email', sql.VarChar, Email)
            .input('RiderNumber', sql.Int, RiderNumber)
            .input('Date', sql.Date, Date)
            .input('CircuitID', sql.Int, CircuitID)
            .query('INSERT INTO Reservations (FirstName, LastName, PhoneNumber, Email, RiderNumber, Date, CircuitID) VALUES (@FirstName, @LastName, @PhoneNumber, @Email, @RiderNumber, @Date, @CircuitID)');

            res.status(201).send('Reservations created successfully!')
    } catch (error){
        console.error('Error adding new reservation to database:', error);
        res.status(500).send('An error occurred while processing your request');
    }
})

app.post('/api/register', async (req, res) => {
    const { username, password, email, first_name, last_name } = req.body;
    const role = 'user'; // Default role

    try {
        const pool = await sql.connect(connection2);
        const result = await pool.request()
            .input('username', sql.VarChar, username)
            .input('password', sql.VarChar, password)
            .input('email', sql.VarChar, email)
            .input('first_name', sql.VarChar, first_name)
            .input('last_name', sql.VarChar, last_name)
            .input('role', sql.VarChar, role)
            .query('INSERT INTO Admins (username, password, email, first_name, last_name, role) VALUES (@username, @password, @email, @first_name, @last_name, @role)');

        res.status(201).send('User registered successfully');
    } catch (error) {
        console.error('Error inserting user into database:', error);
        res.status(500).send('An error occurred while processing your request');
    }
});

app.get('/my-reservations/:email', async (req, res) => {
    const email = req.params.email;

    console.log('email params', email);

    try {
        const pool = await sql.connect(connection2);
        const result = await pool.request().input('Email', sql.VarChar, email).query('SELECT * FROM Reservations WHERE Email = @Email');
        console.log('result', result);

        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching reservations:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

