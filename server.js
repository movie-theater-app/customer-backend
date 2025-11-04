const express = require('express');
const app = express();
const { query } = require('./db');
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) =>  {
    res.send('Hello world from NorthStar Movie theatre!')
});

app.post('/theaters/add', async (req, res) => {
    try {
        const { name, address, contact_information } = req.body;
        
        if (!name || !address || !contact_information) {
            return res.status(400).json({
                error: 'All information must be filled'
            });
        }

        const result = await query(
            'INSERT INTO theaters (name, address, contact_information) VALUES ($1, $2, $3) RETURNING *',
            [name, address, contact_information]
        );

        res.status(201).json({
            message: 'Theater added successfully',
            theater: result.rows[0]
        });
    } catch (error) {
        console.error('Error adding theater:', error);
        res.status(500).json({ error: 'Failed to add theater' });
    }
});

app.get('/theaters', async (req, res) => {
    try {
        const result = await query('SELECT * FROM theaters');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching theaters:', error);
        res.status(500).json({ error: 'Failed to fetch theaters' });
    }
});

app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
