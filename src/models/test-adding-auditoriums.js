const express = require('express');
const router = express.Router();
const { query } = require('../src/db/db');

router.post('/add', async (req, res) => {
    try {
        const { theater_id, name, seat_count } = req.body;
        
        if (!theater_id || !name || !seat_count) {
            return res.status(400).json({
                error: 'All information must be filled'
            });
        }

        const result = await query(
            'INSERT INTO auditoriums (theater_id, name, seat_count) VALUES ($1, $2, $3) RETURNING *',
            [theater_id, name, seat_count]
        );

        res.status(201).json({
            message: 'Auditorium added successfully',
            auditorium: result.rows[0]
        });
    } catch (error) {
        console.error('Error adding auditorium:', error);
        res.status(500).json({ error: 'Failed to add auditorium' });
    }
});

router.get('/', async (req, res) => {
    try {
        const result = await query('SELECT * FROM auditoriums');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching auditoriums:', error);
        res.status(500).json({ error: 'Failed to fetch auditoriums' });
    }
});

module.exports = router;
