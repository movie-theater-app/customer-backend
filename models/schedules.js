const express = require('express');
const router = express.Router();
const { query } = require('../src/db/db.js');

router.get('/', async (req, res) => {
    try {
        const result = await query('SELECT * FROM schedules');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching schedules:', error);
        res.status(500).json({ error: 'Failed to fetch schedules' });
    }
});

module.exports = router;