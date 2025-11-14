const express = require('express');
const router = express.Router();
const { query } = require('../src/db/db.js');

router.get('/', async (req, res) => {
    try {
        const result = await query('SELECT * FROM movies');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching movies:', error);
        res.status(500).json({ error: 'Failed to fetch movies' });
    }
});

module.exports = router;