const db = require('../db/db');

// Hae kaikki paikat tietystä auditorionista
async function getSeatsByAuditorium(auditoriumId) {
  const result = await db.query(
    `SELECT id, seat_row AS row, seat_number AS number, status
     FROM seats
     WHERE auditorium_id = $1
     ORDER BY seat_row, seat_number`,
    [auditoriumId]
  );
  return result.rows;
}

// Päivitä valitut paikat varatuksi
async function reserveSeats(auditoriumId, selectedSeats) {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // Tarkista onko varattu
    const reserved = await db.query(
      `SELECT seat_row, seat_number
       FROM seats
       WHERE auditorium_id = $1 AND status = 'reserved'
         AND seat_row = ANY($2)
         AND seat_number = ANY($3)`,
      [auditoriumId, selectedSeats.map(seat => seat.row), selectedSeats.map(seat => seat.number)]
    );

    if (reserved.rows.length > 0) {
      await client.query('ROLLBACK');
      return { success: false, alreadyReserved: reserved.rows };
    }

    // Merkitse varatuiksi
    for (const seat of selectedSeats) {
      await client.query(
        `UPDATE seats SET status = 'reserved'
         WHERE auditorium_id = $1 AND seat_row = $2 AND seat_number = $3`,
        [auditoriumId, seat.row, seat.number]
      );
    }

    await client.query('COMMIT');
    return { success: true };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  getSeatsByAuditorium,
  reserveSeats
};
