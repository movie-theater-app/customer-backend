const express = require('express');
const router = express.Router();
const { query } = require('../db/db.js');

router.get('/', async (req, res) => {
    try {
        const result = await query(`
            SELECT 
                id,
                movie_id,
                auditorium_id,
                screening_date::text as screening_date,
                start_time,
                end_time,
                theater_id
            FROM schedules
        `);
        
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching schedules:', error);
        res.status(500).json({ error: 'Failed to fetch schedules' });
    }
});
router.get('/get/:id', async (req, res) => {

    const { id } = req.params;

    try {
        const result = await query(`
            SELECT 
                movie_id,
                auditorium_id,
                screening_date::text as screening_date,
                start_time,
                end_time,
                theater_id
            FROM schedules
            WHERE id = $1
        `, [id]);

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching schedules:', error);
        res.status(500).json({ error: 'Failed to fetch schedules' });
    }
})

module.exports = router;