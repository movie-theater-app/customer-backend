 const db = require('../db/db');


async function createBooking(scheduleId, seats, movieId) {
  try {
    // create a new booking with schedule + movie
    const bookingResult = await db.query(
      `INSERT INTO bookings (schedule_id, movie_id, total_amount, payment_status)
       VALUES ($1, $2, 0, 'pending')
       RETURNING id`,
      [scheduleId, movieId]
    );

    const bookingId = bookingResult.rows[0].id;

    // reserve seats permanently and link them to booking
    for (const seat of seats) {
      // update seat to permanent reserve in showtime_seats table
      await db.query(
        `UPDATE showtime_seats
           SET status = 'reserved',
               reserve_hold_expires_at = NULL
         WHERE schedule_id = $1 AND seat_id = $2`,
        [scheduleId, seat.seat_id]
      );

      // insert into booking_seats table
      await db.query(
         `INSERT INTO booking_seats (booking_id, seat_id)
          VALUES ($1, $2)`,
        [bookingId, seat.seat_id]
      );
    }

    return { success: true, bookingId };
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
}

// Called after user has selected ticket types & payment provider confirms payment
async function confirmBooking(bookingId, totalAmount, paymentStatus) {
  try {
    // update the booking with final price + payment state
    await db.query(
      `UPDATE bookings
         SET total_amount = $1,
             payment_status = $2
       WHERE id = $3`,
      [totalAmount, paymentStatus, bookingId]
    );

    return { success: true, bookingId };
  } catch (error) {
    console.error("Error confirming booking:", error);
    throw error;
  }
}

//Method to get tickets depending on the booking ID
 async function getTicketsFromBooking(bookingId) {
    try {
        const query = `
        SELECT * 
        FROM tickets
        WHERE booking_id = $1;`;

        const result = await db.query(query, [bookingId]);

        if(result.rowCount === 0){
            console.log(`Error getting the tickets from the booking with id ${bookingId}`);
            throw new Error(`Error getting the tickets from the booking with id ${bookingId}`);
        }
        return result.rows;
    } catch (error) {
        console.error(`Error getting tickets from booking with id: ${bookingId}`, error);
    }
 }


// Called to get the seats amount so the user can select the actual ticket types
 async function getBookingSeats(bookingId){
    try{
        const query = `
        SELECT seats
        FROM bookings
        WHERE id = $1;`;

        const result = await db.query(query, [bookingId]);

        if (result.rowCount === 0) {
            console.log(`Error getting seats from booking. Booking with id ${bookingId}`);
            throw new Error("Error getting seats from booking");
        }

        return result.rows;
    } catch (error) {
        console.error(`Error getting seats from booking with id: ${bookingId}`, error);
    }
 }


module.exports = {
  createBooking,
  confirmBooking,
  getTicketsFromBooking,
  getBookingSeats,
};
