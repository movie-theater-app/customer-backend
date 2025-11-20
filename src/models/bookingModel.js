const db = require('../db/db');

async function confirmBooking(auditoriumId, selectedSeats, totalAmount, paymentStatus) {
  try {
    // create new booking
    const bookingResult = await db.query(
      `INSERT INTO bookings (schedule_id, movie_id, total_amount, payment_status)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [ selectedSeats[0].scheduleId, 
        selectedSeats[0].movieId, 
        totalAmount, 
        paymentStatus]
    );
    const bookingId = bookingResult.rows[0].id;

    // update all selected seats to permanent reservation (no timer)
    for (const seat of selectedSeats) {
      await db.query(
        `UPDATE seats
         SET status = 'reserved', reserve_hold_expires_at = NULL
         WHERE auditorium_id = $1 AND seat_row = $2 AND seat_number = $3`,
        [auditoriumId, seat.row, seat.number]
      );
    }

    // connect seats to booking_seats table
    for (const seat of selectedSeats) {
      await db.query(
        `INSERT INTO booking_seats (booking_id, seat_id)
         SELECT $1, id FROM seats
         WHERE auditorium_id = $2 AND seat_row = $3 AND seat_number = $4`,
        [bookingId, auditoriumId, seat.row, seat.number]
      );
    }

    return { success: true, bookingId };
  } catch (error) {
    console.error('Error confirming booking:', error);
    throw error;
  }
}

module.exports = { confirmBooking };
