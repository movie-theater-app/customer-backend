const db = require('../db/db');

// get all seats for given auditorium
async function getSeatsByAuditorium(auditoriumId) {
  const result = await db.query(
    `SELECT id, seat_row AS row, seat_number AS number, seat_type, status
     FROM seats
     WHERE auditorium_id = $1
     ORDER BY seat_row, seat_number`,
    [auditoriumId]
  );
   // get seat_count from auditorium to calculate rows and columns
  const auditorium = await db.query(
    `SELECT seat_count FROM auditoriums WHERE id=$1`,
    [auditoriumId]
  );
  const seatCount = auditorium.rows[0].seat_count;

  // calculate columns like staff-backend's createSeats
  function calculateColumns(seatCount) {
    if (seatCount <= 80) return 12;
    if (seatCount <= 150) return 15;
    if (seatCount <= 200) return 18;
    return 22;
  }

  const columns = calculateColumns(seatCount);
  const rows = Math.ceil(seatCount / columns);

  return { seats: result.rows, rows, columns };
}


// update the selected seats as reserved (temporary 5 min hold)
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

    //SQL query to check if any of the selected seats are already reserved or on hold
    const reservedQuery = `
      SELECT seat_row, seat_number
      FROM seats
      WHERE auditorium_id = $1 
        AND (status = 'reserved' OR (status = 'hold' AND reserve_hold_expires_at > NOW()))
        AND (seat_row, seat_number) IN (${placeholders})
    `;
     // execute the query passing auditoriumId as $1 and all the seat row/number pairs
    const reserved = await db.query(reservedQuery, [auditoriumId, ...values]);
     // if any of the seats are already reserved they are returned --> all or nothing reservation
    if (reserved.rows.length > 0) {
      return { success: false, alreadyReserved: reserved.rows };
    }

    // loop over the selected seats and update each one to hold for 5 minutes
    for (const seat of selectedSeats) {
      await db.query(
        `UPDATE seats 
        SET status = 'reserved', 
          reserve_hold_expires_at = NOW() + INTERVAL '5 minutes'
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

// function to release expired on-hold seats 
async function releaseExpiredHolds() {
  try {
    await db.query(
      `UPDATE seats
       SET status = 'available', reserve_hold_expires_at = NULL
       WHERE status = 'reserved' AND reserve_hold_expires_at <= NOW()`
    );
  } catch (err) {
    console.error('Error releasing expired holds:', err);
  }
}

// runs every minute to release expired holds
setInterval(releaseExpiredHolds, 60 * 1000);


module.exports = {
  getSeatsByAuditorium,
  reserveSeats
};
