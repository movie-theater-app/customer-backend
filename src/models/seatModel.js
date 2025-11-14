const db = require('../db/db');

//fetch all seats for given auditorium
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

// update the selected seats as reserved
async function reserveSeats(auditoriumId, selectedSeats) {
  // check if any seats were actually selected
  if (!selectedSeats || selectedSeats.length === 0) {
    return { success: false, message: 'No seats selected' };
  }

  try {
    // arrays for SQL placeholders and values for tuple comparison (group pairs-> row, number)
    const values = []; // This will hold the seat_row and seat_number for each selected seat
    const placeholders = selectedSeats
      .map((seat, index) => {
        // Push row and number into the values array
        values.push(seat.row, seat.number);
        // Create a placeholder tuple like ($2, $3), ($4, $5)
        return `($${2 * index + 2}, $${2 * index + 3})`;
      })
      .join(', ');

    //SQL query to check if any of the selected seats are already reserved
    const reservedQuery = `
      SELECT seat_row, seat_number
      FROM seats
      WHERE auditorium_id = $1 AND status = 'reserved'
        AND (seat_row, seat_number) IN (${placeholders})
    `;
     // execute the query passing auditoriumId as $1 and all the seat row/number pairs
    const reserved = await db.query(reservedQuery, [auditoriumId, ...values]);
     // if any of the seats are already reserved they are returned --> all or nothing reservation
    if (reserved.rows.length > 0) {
      return { success: false, alreadyReserved: reserved.rows };
    }

    // loop over the selected seats and update each one to reserved
    for (const seat of selectedSeats) {
      await db.query(
        `UPDATE seats SET status = 'reserved'
         WHERE auditorium_id = $1 AND seat_row = $2 AND seat_number = $3`,
        [auditoriumId, seat.row, seat.number]
      );
    }

    return { success: true };
  } catch (error) {
    console.error('Error reserving seats:', error);
    throw error;
  }
}

module.exports = {
  getSeatsByAuditorium,
  reserveSeats
};
