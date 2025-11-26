const db = require('../db/db');

// get seats for a specific showtime
// this connects 3 tables with join-operation (showtime_seats, seats ans schedules)
async function getSeatsByShowtime(scheduleId) {
    console.log('scheduleId received:', scheduleId);
    // ensure scheduleId is provided
     if (!scheduleId) {
        throw new Error('scheduleId is required');
        }
        // ensure scheduleId is a number
        if (isNaN(scheduleId)) {
        throw new Error('scheduleId must be a number');
        }
    try {
        console.log('Fetching seats for scheduleId:', scheduleId);
    
        // Main query -> get all seats for given showtime
        // - ss = showtime_seats alias
        // - s = seats (actual seat layout) alias
        // - sc = schedules (to get movie_id and theater_id) alias
        const result = await db.query(
            `SELECT ss.id AS showtime_seat_id,
                    s.seat_row AS row,
                    s.seat_number AS number,
                    s.seat_type,
                    ss.status,
                    sc.movie_id, 
                    sc.theater_id
            FROM showtime_seats ss
            JOIN seats s ON ss.seat_id = s.id
            JOIN schedules sc ON sc.id = ss.schedule_id
            WHERE ss.schedule_id = $1
            ORDER BY s.seat_row, s.seat_number`,
            [scheduleId]
        );

         console.log("Rows found:", result.rowCount);

        // get auditorium info for layout
        const auditoriumResult = await db.query(
            `SELECT a.seat_count
            FROM auditoriums a
            JOIN seats s ON s.auditorium_id = a.id
            JOIN showtime_seats ss ON ss.seat_id = s.id
            WHERE ss.schedule_id = $1
            LIMIT 1`,
            [scheduleId]
        );
        // error if no auditorium is linked to schedule
        if (auditoriumResult.rows.length === 0) {
            throw new Error('No auditorium found for this schedule');
        }

        const seatCount = auditoriumResult.rows[0].seat_count;
        // cxalculate how many columns to show in the seat map UI (same as in staff app seat-map generating)
        function calculateColumns(seatCount) {
            if (seatCount <= 80) return 12;
            if (seatCount <= 150) return 15;
            if (seatCount <= 200) return 18;
            return 22;
        }

        const columns = calculateColumns(seatCount);
        const rows = Math.ceil(seatCount / columns); // total rows needed for seat map

        return { seats: result.rows, rows, columns };
        }
    catch (err) {
        console.error('Error in getSeatsByShowtime:', err);
        throw err;
  }
}

// reserve seats temporarily
async function reserveSeats(scheduleId, selectedSeats) {
  if (!selectedSeats || selectedSeats.length === 0) return { success: false };

  const conditions = []; // dynamic WHERE conditions for multiple seats
  const values = [scheduleId];
  selectedSeats.forEach((seat, i) => {
    values.push(seat.row, seat.number); // add each seat row and number to values array
    // dynamic condition for SQL (row=X AND number=Y) -> tuple pairs
    conditions.push(`(s.seat_row = $${2*i+2} AND s.seat_number = $${2*i+3})`);  
  });
   // query for checking already reserved seats
  const reservedQuery = `
    SELECT s.seat_row, s.seat_number
    FROM showtime_seats ss
    JOIN seats s ON ss.seat_id = s.id
    WHERE ss.schedule_id = $1
      AND ss.status = 'reserved'
      AND (ss.reserve_hold_expires_at IS NULL OR ss.reserve_hold_expires_at > NOW())
      AND (${conditions.join(' OR ')})
  `;

  const reserved = await db.query(reservedQuery, values);
  console.log(`Reserving seats for scheduleId ${scheduleId}:`, selectedSeats);

  if (reserved.rows.length > 0) return { success: false, alreadyReserved: reserved.rows };

  // reserve seats for 5 minutes (temporary hold)
  for (const seat of selectedSeats) {
    await db.query(
      `UPDATE showtime_seats ss
       SET status = 'reserved',
           reserve_hold_expires_at = NOW() + INTERVAL '5 minutes'
       FROM seats s
       WHERE ss.schedule_id = $1
         AND ss.seat_id = s.id
         AND s.seat_row = $2
         AND s.seat_number = $3`,
      [scheduleId, seat.row, seat.number]
    );
  }

  return { success: true };
}

// release selected seats manually
async function releaseSeats(scheduleId, seatsToRelease) {
  if (!seatsToRelease || seatsToRelease.length === 0) return { success: false };

  for (const seat of seatsToRelease) {
    await db.query(
      `UPDATE showtime_seats ss
       SET status = 'available',
           reserve_hold_expires_at = NULL
       FROM seats s
       WHERE ss.schedule_id = $1
         AND ss.seat_id = s.id
         AND s.seat_row = $2
         AND s.seat_number = $3`,
      [scheduleId, seat.row, seat.number]
    );
  }
  console.log(`Released seats for scheduleId ${scheduleId}:`, seatsToRelease);
  return { success: true };
}

// release expired reservations every minute
setInterval(async () => {
  await db.query(
    `UPDATE showtime_seats
     SET status = 'available',
         reserve_hold_expires_at = NULL
     WHERE status = 'reserved' AND reserve_hold_expires_at <= NOW()`
  );
}, 60 * 1000);

module.exports = { getSeatsByShowtime, reserveSeats, releaseSeats };
